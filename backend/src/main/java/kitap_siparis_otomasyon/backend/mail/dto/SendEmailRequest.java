package kitap_siparis_otomasyon.backend.mail.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendEmailRequest {

    private String to;
    private String subject;
    private String text;
    private boolean includeActivationCode;
}
