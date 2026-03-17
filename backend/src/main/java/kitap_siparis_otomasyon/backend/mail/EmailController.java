package kitap_siparis_otomasyon.backend.mail;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/mail")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody EmailRequest request) {
        try {
            String response = emailService.sendEmail(
                    request.getTo(),
                    request.getSubject(),
                    request.getText());
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "E-posta başarıyla gönderildi",
                    "mailgunResponse", response != null ? response : ""));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "E-posta gönderilemedi: " + e.getMessage()));
        }
    }
}
