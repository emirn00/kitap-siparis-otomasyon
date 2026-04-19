package kitap_siparis_otomasyon.backend.rabbitmq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class EmailTaskProducer {

    private final RabbitTemplate rabbitTemplate;

    public EmailTaskProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendEmailTask(EmailTaskMessage message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_EXCHANGE, RabbitMQConfig.EMAIL_ROUTING_KEY, message);
        System.out.println("Sent EmailTaskMessage to queue for: " + message.getTo());
    }
}
