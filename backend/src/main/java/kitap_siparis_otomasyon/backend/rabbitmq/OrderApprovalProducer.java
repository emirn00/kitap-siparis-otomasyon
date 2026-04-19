package kitap_siparis_otomasyon.backend.rabbitmq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrderApprovalProducer {

    private final RabbitTemplate rabbitTemplate;

    public OrderApprovalProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderApprovedMessage(UUID orderId) {
        OrderApprovedMessage message = new OrderApprovedMessage(orderId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
        System.out.println("Sent OrderApprovedMessage for orderId: " + orderId);
    }
}
