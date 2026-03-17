package kitap_siparis_otomasyon.backend.mail.controller;

import kitap_siparis_otomasyon.backend.mail.dto.BulkEmailRequest;
import kitap_siparis_otomasyon.backend.mail.dto.EmailLogResponse;
import kitap_siparis_otomasyon.backend.mail.dto.SendEmailRequest;
import kitap_siparis_otomasyon.backend.mail.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/mail")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailLogResponse> sendEmail(@RequestBody SendEmailRequest request) {
        EmailLogResponse response = emailService.sendEmail(
                request.getTo(),
                request.getSubject(),
                request.getText(),
                request.isIncludeActivationCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmailLogResponse>> sendBulkEmail(@RequestBody BulkEmailRequest request) {
        List<EmailLogResponse> responses = emailService.sendBulkEmail(
                request.getToList(),
                request.getSubject(),
                request.getText(),
                request.isIncludeActivationCode());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmailLogResponse>> getAllLogs() {
        return ResponseEntity.ok(emailService.getAllLogs());
    }

    @GetMapping("/logs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailLogResponse> getLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(emailService.getLogById(id));
    }

    @GetMapping("/logs/by-recipient")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmailLogResponse>> getLogsByRecipient(@RequestParam String email) {
        return ResponseEntity.ok(emailService.getLogsByRecipient(email));
    }
}
