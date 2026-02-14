package kitap_siparis_otomasyon.backend.order.service;

import kitap_siparis_otomasyon.backend.book.entity.Book;
import kitap_siparis_otomasyon.backend.book.repository.BookRepository;
import kitap_siparis_otomasyon.backend.order.dto.CreateOrderRequest;
import kitap_siparis_otomasyon.backend.order.dto.OrderResponse;
import kitap_siparis_otomasyon.backend.order.dto.UpdateOrderRequest;
import kitap_siparis_otomasyon.backend.order.entity.Order;
import kitap_siparis_otomasyon.backend.order.repository.OrderRepository;
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

    public OrderService(OrderRepository orderRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Book> books = bookRepository.findAllById(request.getBookIds());

        if (books.size() != request.getBookIds().size()) {
            throw new RuntimeException("Some books were not found");
        }

        Order order = new Order(user, books);
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
    public List<OrderResponse> getOrdersByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

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

        order.setBooks(books);
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
}
