package kitap_siparis_otomasyon.backend.book.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "books")
@Getter
@Setter
public class Book {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "request_name", nullable = false)
    private String requestName;

    @Column(name = "order_name", nullable = false)
    private String orderName;

    @Column(name = "isbn", nullable = false)
    private String isbn;

    @Column(name = "lisencode_name")
    private String lisencodeName;

    protected Book() {
    }

    public Book(String requestName, String orderName, String isbn, String lisencodeName) {
        this.requestName = requestName;
        this.orderName = orderName;
        this.isbn = isbn;
        this.lisencodeName = lisencodeName;
    }

}
