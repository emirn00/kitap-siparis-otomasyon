package kitap_siparis_otomasyon.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner schemaUpdater(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS mailed BOOLEAN DEFAULT FALSE NOT NULL;");
				System.out.println("Schema update: added 'mailed' column to 'orders' table if it didn't exist.");
			} catch (Exception e) {
				System.err.println("Schema update failed (might already exist): " + e.getMessage());
			}
		};
	}
}
