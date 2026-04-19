package kitap_siparis_otomasyon.backend.order.dto;

import kitap_siparis_otomasyon.backend.order.entity.OrderBook;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class OrderBookResponse {
    private UUID id;
    private String requestName;
    private String title;
    private String interactiveCode;

    public static OrderBookResponse fromEntity(OrderBook orderBook) {
        OrderBookResponse response = new OrderBookResponse();
        if (orderBook.getBook() != null) {
            response.setId(orderBook.getBook().getId());
            response.setRequestName(orderBook.getBook().getRequestName());
            response.setTitle(orderBook.getBook().getRequestName()); // Keep frontend compatibility
        }
        response.setInteractiveCode(orderBook.getInteractiveCode());
        return response;
    }
}
