package kitap_siparis_otomasyon.backend.rabbitmq;

import kitap_siparis_otomasyon.backend.order.entity.Order;
import kitap_siparis_otomasyon.backend.order.entity.OrderBook;
import kitap_siparis_otomasyon.backend.order.repository.OrderRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OrderCodeGenerationConsumer {

    private final OrderRepository orderRepository;
    private final CodeGeneratorService codeGeneratorService;

    public OrderCodeGenerationConsumer(OrderRepository orderRepository, CodeGeneratorService codeGeneratorService) {
        this.orderRepository = orderRepository;
        this.codeGeneratorService = codeGeneratorService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    @Transactional
    public void receiveOrderApprovedMessage(OrderApprovedMessage message) {
        System.out.println("Received OrderApprovedMessage for orderId: " + message.getOrderId());
        Optional<Order> orderOptional = orderRepository.findById(message.getOrderId());
        
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            boolean updated = false;

            for (OrderBook orderBook : order.getOrderBooks()) {
                if (orderBook.getInteractiveCode() == null || orderBook.getInteractiveCode().isEmpty()) {
                    String code = codeGeneratorService.generateInteractiveCode();
                    orderBook.setInteractiveCode(code);
                    updated = true;
                }
            }

            if (updated) {
                orderRepository.save(order);
                System.out.println("Generated interactive codes for orderId: " + order.getId());
            }
        } else {
            System.err.println("Order not found for ID: " + message.getOrderId());
        }
    }
}
