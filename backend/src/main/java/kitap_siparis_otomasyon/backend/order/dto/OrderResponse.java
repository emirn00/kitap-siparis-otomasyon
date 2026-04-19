package kitap_siparis_otomasyon.backend.order.dto;

import kitap_siparis_otomasyon.backend.order.entity.Order;
import kitap_siparis_otomasyon.backend.order.entity.OrderBook;
import kitap_siparis_otomasyon.backend.order.entity.OrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String email;
    private String phone;
    private List<OrderBookResponse> books;
    private String city;
    private String institution;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean mailed;

    public static OrderResponse fromEntity(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        response.setEmail(order.getUser().getEmail());
        response.setPhone(order.getUser().getPhone());
        response.setBooks(order.getOrderBooks().stream()
                .map(OrderBookResponse::fromEntity)
                .collect(Collectors.toList()));
        response.setCity(order.getCity());
        response.setInstitution(order.getInstitution());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setMailed(order.isMailed());
        return response;
    }
}
