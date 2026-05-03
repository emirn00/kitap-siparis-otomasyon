package kitap_siparis_otomasyon.backend.notification.repository;

import kitap_siparis_otomasyon.backend.notification.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, UUID> {
}
