package kitap_siparis_otomasyon.backend.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import kitap_siparis_otomasyon.backend.book.entity.Book;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "order_books")
@IdClass(OrderBookId.class)
@Getter
@Setter
@NoArgsConstructor
public class OrderBook {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "interactive_code")
    private String interactiveCode;

    public OrderBook(Order order, Book book) {
        this.order = order;
        this.book = book;
    }
}
