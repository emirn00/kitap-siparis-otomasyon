package kitap_siparis_otomasyon.backend.mail.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "mailgun")
public class MailgunConfig {

    private String apiKey;
    private String domain;
    private String from;
}
