package kitap_siparis_otomasyon.backend.notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_logs")
@Getter
@Setter
@NoArgsConstructor
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogType type;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum LogType {
        ORDER,
        MAIL,
        USER_REGISTRATION,
        SYSTEM
    }

    public SystemLog(String title, String message, LogType type) {
        this.title = title;
        this.message = message;
        this.type = type;
    }
}
