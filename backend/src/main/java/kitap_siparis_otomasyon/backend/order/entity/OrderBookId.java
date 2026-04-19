package kitap_siparis_otomasyon.backend.order.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OrderBookId implements Serializable {
    private UUID order;
    private UUID book;
}
