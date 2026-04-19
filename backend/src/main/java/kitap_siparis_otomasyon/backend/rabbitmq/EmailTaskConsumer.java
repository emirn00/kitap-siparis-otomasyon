package kitap_siparis_otomasyon.backend.rabbitmq;

import kitap_siparis_otomasyon.backend.mail.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class EmailTaskConsumer {

    private final EmailService emailService;

    public EmailTaskConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void receiveEmailTask(EmailTaskMessage message) {
        System.out.println("Processing async email task for: " + message.getTo());
        try {
            emailService.processAsyncEmail(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to process async email task for " + message.getTo() + ": " + e.getMessage());
        }
    }
}
