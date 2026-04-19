package kitap_siparis_otomasyon.backend.order.service;

import kitap_siparis_otomasyon.backend.book.entity.Book;
import kitap_siparis_otomasyon.backend.book.repository.BookRepository;
import kitap_siparis_otomasyon.backend.order.dto.CreateOrderRequest;
import kitap_siparis_otomasyon.backend.order.dto.OrderResponse;
import kitap_siparis_otomasyon.backend.order.dto.UpdateOrderRequest;
import kitap_siparis_otomasyon.backend.order.entity.Order;
import kitap_siparis_otomasyon.backend.order.entity.OrderBook;
import kitap_siparis_otomasyon.backend.order.entity.OrderStatus;
import kitap_siparis_otomasyon.backend.order.repository.OrderRepository;
import kitap_siparis_otomasyon.backend.rabbitmq.OrderApprovalProducer;
import kitap_siparis_otomasyon.backend.user.entity.User;
import kitap_siparis_otomasyon.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final OrderApprovalProducer orderApprovalProducer;
    private final kitap_siparis_otomasyon.backend.mail.service.EmailService emailService;

    public OrderService(OrderRepository orderRepository, BookRepository bookRepository, UserRepository userRepository, OrderApprovalProducer orderApprovalProducer, kitap_siparis_otomasyon.backend.mail.service.EmailService emailService) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.orderApprovalProducer = orderApprovalProducer;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Book> books = bookRepository.findAllById(request.getBookIds());

        if (books.size() != request.getBookIds().size()) {
            throw new RuntimeException("Some books were not found");
        }

        Order order = new Order(user);
        List<OrderBook> orderBooks = books.stream()
                .map(book -> new OrderBook(order, book))
                .collect(Collectors.toList());
        order.setOrderBooks(orderBooks);
        order.setCity(request.getCity());
        order.setInstitution(request.getInstitution());
        Order savedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByDateRange(LocalDate startDate, LocalDate endDate, OrderStatus status) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        if (status != null) {
            return orderRepository.findByCreatedAtBetweenAndStatus(startDateTime, endDateTime, status).stream()
                    .map(OrderResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return orderRepository.findByCreatedAtBetween(startDateTime, endDateTime).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateOrder(UUID id, UpdateOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        List<Book> books = bookRepository.findAllById(request.getBookIds());

        if (books.size() != request.getBookIds().size()) {
            throw new RuntimeException("Some books were not found");
        }

        order.getOrderBooks().clear();
        List<OrderBook> orderBooks = books.stream()
                .map(book -> new OrderBook(order, book))
                .collect(Collectors.toList());
        order.getOrderBooks().addAll(orderBooks);
        order.setCity(request.getCity());
        order.setInstitution(request.getInstitution());
        Order savedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(savedOrder);
    }



    @Transactional
    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        
        if (status == OrderStatus.COMPLETED) {
            orderApprovalProducer.sendOrderApprovedMessage(savedOrder.getId());
        }
        
        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMailReadyOrders() {
        // Ready for mail = COMPLETED and all books have codes
        return orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .filter(o -> o.getOrderBooks().stream().allMatch(ob -> ob.getInteractiveCode() != null && !ob.getInteractiveCode().isEmpty()))
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void sendOrderCodesEmail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        emailService.queueOrderCodesEmail(order);
        
        order.setMailed(true);
        orderRepository.save(order);
    }
}
