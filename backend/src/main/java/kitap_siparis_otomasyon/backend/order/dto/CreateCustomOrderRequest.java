package kitap_siparis_otomasyon.backend.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateCustomOrderRequest {
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private String institution;
    private List<UUID> bookIds;
    private String notes;
}
