package kitap_siparis_otomasyon.backend.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Base64;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final MailgunConfig mailgunConfig;
    private final RestClient restClient;

    public EmailService(MailgunConfig mailgunConfig) {
        this.mailgunConfig = mailgunConfig;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.mailgun.net/v3")
                .build();
    }

    public String sendEmail(String to, String subject, String text) {
        String credentials = "api:" + mailgunConfig.getApiKey();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("from", mailgunConfig.getFrom());
        formData.add("to", to);
        formData.add("subject", subject);
        formData.add("text", text);

        log.info("Sending email to: {} with subject: {}", to, subject);

        String response = restClient.post()
                .uri("/{domain}/messages", mailgunConfig.getDomain())
                .header("Authorization", "Basic " + encodedCredentials)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(String.class);

        log.info("Mailgun response: {}", response);
        return response;
    }
}
