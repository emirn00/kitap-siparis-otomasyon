package kitap_siparis_otomasyon.backend.mail.dto;

import kitap_siparis_otomasyon.backend.mail.entity.EmailLog;
import kitap_siparis_otomasyon.backend.mail.entity.EmailStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class EmailLogResponse {

    private UUID id;
    private String recipientEmail;
    private String subject;
    private String body;
    private String activationCode;
    private EmailStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;

    public static EmailLogResponse fromEntity(EmailLog log) {
        EmailLogResponse response = new EmailLogResponse();
        response.setId(log.getId());
        response.setRecipientEmail(log.getRecipientEmail());
        response.setSubject(log.getSubject());
        response.setBody(log.getBody());
        response.setActivationCode(log.getActivationCode());
        response.setStatus(log.getStatus());
        response.setErrorMessage(log.getErrorMessage());
        response.setSentAt(log.getSentAt());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
