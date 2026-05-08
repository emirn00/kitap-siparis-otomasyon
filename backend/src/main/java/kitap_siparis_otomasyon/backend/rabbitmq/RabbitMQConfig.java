package kitap_siparis_otomasyon.backend.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "order.approval.queue";
    public static final String EXCHANGE_NAME = "order.exchange";
    public static final String ROUTING_KEY = "order.routing.key";

    public static final String EMAIL_QUEUE = "email.task.queue";
    public static final String EMAIL_EXCHANGE = "email.exchange";
    public static final String EMAIL_ROUTING_KEY = "email.routing.key";

    // DLQ Constants
    public static final String DLQ_EXCHANGE = "dead.letter.exchange";
    public static final String DLQ_QUEUE = "dead.letter.queue";
    public static final String DLQ_ROUTING_KEY = "dead.letter.routing.key";

    @Bean
    public Queue queue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLQ_EXCHANGE);
        args.put("x-dead-letter-routing-key", DLQ_ROUTING_KEY);
        return new Queue(QUEUE_NAME, true, false, false, args);
    }

    @Bean
    public Queue emailQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLQ_EXCHANGE);
        args.put("x-dead-letter-routing-key", DLQ_ROUTING_KEY);
        return new Queue(EMAIL_QUEUE, true, false, false, args);
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue(DLQ_QUEUE, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public DirectExchange emailExchange() {
        return new DirectExchange(EMAIL_EXCHANGE);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLQ_EXCHANGE);
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder.bind(emailQueue()).to(emailExchange()).with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DLQ_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
