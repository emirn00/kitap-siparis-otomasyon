package kitap_siparis_otomasyon.backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatbotResponse {
    private String reply;
    private String sql; // Optional: For debugging or transparency
}
