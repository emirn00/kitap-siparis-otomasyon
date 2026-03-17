package kitap_siparis_otomasyon.backend.mail.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkEmailRequest {

    private List<String> toList;
    private String subject;
    private String text;
    private boolean includeActivationCode;
}
