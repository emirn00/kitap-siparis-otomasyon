package kitap_siparis_otomasyon.backend.mail.repository;

import kitap_siparis_otomasyon.backend.mail.entity.EmailLog;
import kitap_siparis_otomasyon.backend.mail.entity.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {

    List<EmailLog> findByRecipientEmail(String recipientEmail);

    List<EmailLog> findByStatus(EmailStatus status);

    List<EmailLog> findByActivationCodeAndRecipientEmail(String activationCode, String recipientEmail);
}
