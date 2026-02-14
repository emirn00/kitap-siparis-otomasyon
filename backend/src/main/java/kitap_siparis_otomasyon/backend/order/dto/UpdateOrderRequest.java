package kitap_siparis_otomasyon.backend.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UpdateOrderRequest {
    private List<UUID> bookIds;
    private String city;
    private String institution;
}
