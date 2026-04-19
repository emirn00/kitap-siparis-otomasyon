package kitap_siparis_otomasyon.backend.order.entity;

import jakarta.persistence.*;
import kitap_siparis_otomasyon.backend.book.entity.Book;
import kitap_siparis_otomasyon.backend.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderBook> orderBooks;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String institution;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private OrderStatus status = OrderStatus.PENDING;

    public Order() {
    }

    public Order(User user) {
        this.user = user;
        this.status = OrderStatus.PENDING;
    }
}
