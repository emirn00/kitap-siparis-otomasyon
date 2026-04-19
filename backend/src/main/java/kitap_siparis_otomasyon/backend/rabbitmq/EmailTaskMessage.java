package kitap_siparis_otomasyon.backend.rabbitmq;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailTaskMessage {
    private UUID logId;
    private String to;
    private String subject;
    private String body;
}
