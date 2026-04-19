package kitap_siparis_otomasyon.backend.mail.service;

import kitap_siparis_otomasyon.backend.mail.config.MailgunConfig;
import kitap_siparis_otomasyon.backend.mail.dto.EmailLogResponse;
import kitap_siparis_otomasyon.backend.mail.entity.EmailLog;
import kitap_siparis_otomasyon.backend.mail.entity.EmailStatus;
import kitap_siparis_otomasyon.backend.mail.repository.EmailLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import kitap_siparis_otomasyon.backend.rabbitmq.EmailTaskMessage;
import kitap_siparis_otomasyon.backend.rabbitmq.EmailTaskProducer;
import kitap_siparis_otomasyon.backend.order.entity.Order;
import kitap_siparis_otomasyon.backend.order.entity.OrderBook;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final MailgunConfig mailgunConfig;
    private final EmailLogRepository emailLogRepository;
    private final RestClient restClient;
    private final EmailTaskProducer emailTaskProducer;

    public EmailService(MailgunConfig mailgunConfig, EmailLogRepository emailLogRepository, EmailTaskProducer emailTaskProducer) {
        this.mailgunConfig = mailgunConfig;
        this.emailLogRepository = emailLogRepository;
        this.emailTaskProducer = emailTaskProducer;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.mailgun.net/v3")
                .build();
    }

    @Transactional
    public EmailLogResponse sendEmail(String to, String subject, String text, boolean includeActivationCode) {
        String activationCode = null;
        String finalText = text;

        if (includeActivationCode) {
            activationCode = generateActivationCode();
            finalText = text + "\n\nAktivasyon Kodunuz: " + activationCode;
        }

        EmailLog emailLog = new EmailLog();
        emailLog.setRecipientEmail(to);
        emailLog.setSubject(subject);
        emailLog.setBody(finalText);
        emailLog.setActivationCode(activationCode);
        emailLog.setStatus(EmailStatus.QUEUED);
        emailLogRepository.save(emailLog);

        try {
            callMailgunApi(to, subject, finalText);

            emailLog.setStatus(EmailStatus.SENT);
            emailLog.setSentAt(LocalDateTime.now());
            emailLogRepository.save(emailLog);

            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);

            log.error("Failed to send email to: {} - {}", to, e.getMessage());
            throw new RuntimeException("E-posta gönderilemedi: " + e.getMessage());
        }

        return EmailLogResponse.fromEntity(emailLog);
    }

    @Transactional
    public List<EmailLogResponse> sendBulkEmail(List<String> toList, String subject, String text,
            boolean includeActivationCode) {
        return toList.stream()
                .map(to -> sendEmail(to, subject, text, includeActivationCode))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmailLogResponse> getAllLogs() {
        return emailLogRepository.findAll().stream()
                .map(EmailLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmailLogResponse getLogById(UUID id) {
        EmailLog emailLog = emailLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email log not found with id: " + id));
        return EmailLogResponse.fromEntity(emailLog);
    }

    @Transactional(readOnly = true)
    public List<EmailLogResponse> getLogsByRecipient(String email) {
        return emailLogRepository.findByRecipientEmail(email).stream()
                .map(EmailLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private void callMailgunApi(String to, String subject, String text) {
        String credentials = "api:" + mailgunConfig.getApiKey();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("from", mailgunConfig.getFrom());
        formData.add("to", to);
        formData.add("subject", subject);
        formData.add("text", text);

        restClient.post()
                .uri("/{domain}/messages", mailgunConfig.getDomain())
                .header("Authorization", "Basic " + encodedCredentials)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(String.class);
    }

    @Transactional
    public void queueOrderCodesEmail(Order order) {
        String to = order.getUser().getEmail();
        String subject = "Kitap Siparişiniz - İnteraktif Aktivasyon Kodları";
        
        StringBuilder sb = new StringBuilder();
        sb.append("Merhaba ").append(order.getUser().getFullName()).append(",\n\n");
        sb.append("Sipariş ettiğiniz dijital kitapların aktivasyon kodları aşağıdadır:\n\n");
        
        for (OrderBook ob : order.getOrderBooks()) {
            sb.append("- ").append(ob.getBook().getRequestName())
              .append(": ").append(ob.getInteractiveCode() != null ? ob.getInteractiveCode() : "Hata (Lütfen admin ile iletişime geçin)")
              .append("\n");
        }
        
        sb.append("\nİyi çalışmalar dileriz.");
        String body = sb.toString();

        EmailLog emailLog = new EmailLog();
        emailLog.setRecipientEmail(to);
        emailLog.setSubject(subject);
        emailLog.setBody(body);
        emailLog.setStatus(EmailStatus.QUEUED);
        EmailLog savedLog = emailLogRepository.save(emailLog);

        // Queue the task
        EmailTaskMessage task = new EmailTaskMessage(savedLog.getId(), to, subject, body);
        emailTaskProducer.sendEmailTask(task);
        
        log.info("Order codes email for orderId {} queued for recipient: {}", order.getId(), to);
    }

    @Transactional
    public void processAsyncEmail(EmailTaskMessage task) {
        EmailLog emailLog = emailLogRepository.findById(task.getLogId())
                .orElse(null);

        try {
            callMailgunApi(task.getTo(), task.getSubject(), task.getBody());
            
            if (emailLog != null) {
                emailLog.setStatus(EmailStatus.SENT);
                emailLog.setSentAt(LocalDateTime.now());
                emailLogRepository.save(emailLog);
            }
            log.info("Async email sent successfully to: {}", task.getTo());
        } catch (Exception e) {
            if (emailLog != null) {
                emailLog.setStatus(EmailStatus.FAILED);
                emailLog.setErrorMessage(e.getMessage());
                emailLogRepository.save(emailLog);
            }
            log.error("Failed to send async email to: {} - {}", task.getTo(), e.getMessage());
        }
    }

    private String generateActivationCode() {
        int code = ThreadLocalRandom.current().nextInt(100000, 999999);
        return String.valueOf(code);
    }
}
