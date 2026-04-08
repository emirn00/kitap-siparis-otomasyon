package kitap_siparis_otomasyon.backend.chatbot.service;

import kitap_siparis_otomasyon.backend.chatbot.dto.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final JdbcTemplate jdbcTemplate;
    private final RestClient.Builder restClientBuilder;

    @Value("${deepseek.api-key}")
    private String apiKey;

    @Value("${deepseek.api-url}")
    private String apiUrl;

    private static final String SQL_GEN_SYSTEM_PROMPT = """
            You are a backend assistant of a bookstore system.
            Rules:
            - Only generate SELECT queries.
            - Never modify data.
            - Always limit results to max 10 rows (LIMIT 10).
            - Use the provided schema exactly.
            - If the question is not about the database, answer normally.
            - Return ONLY the SQL query or a standard text response. No markdown or explanation in this phase.

            Schema:
            1. users (id UUID, firstName, lastName, email, phone, role)
            2. books (id UUID, request_name, order_name, isbn, lisencode_name)
            3. orders (id UUID, user_id UUID, city, institution, created_at, status)
            4. order_books (order_id UUID, book_id UUID) -- Join table
            """;

    private static final String SUMMARY_SYSTEM_PROMPT = """
            You are a bookstore assistant. Below is a user's question and the data retrieved from our database.
            Summarize the findings in a friendly, conversational tone.
            If the data is empty, mention that no results were found.
            """;

    public ChatbotResponse processMessage(String userMessage) {
        // Step 1: Generate SQL (or normal response)
        String llmOutput = callDeepSeek(SQL_GEN_SYSTEM_PROMPT, userMessage);
        
        if (llmOutput.toUpperCase().startsWith("SELECT")) {
            log.info("Generated SQL: {}", llmOutput);
            try {
                // Step 2: Execute SQL
                List<Map<String, Object>> results = jdbcTemplate.queryForList(llmOutput);
                
                // Step 3: Summarize Results
                String summaryMessage = "User asked: " + userMessage + "\nDatabase Results: " + results.toString();
                String finalReply = callDeepSeek(SUMMARY_SYSTEM_PROMPT, summaryMessage);
                
                return new ChatbotResponse(finalReply, llmOutput);
            } catch (Exception e) {
                log.error("Error executing generated SQL: {}", llmOutput, e);
                return new ChatbotResponse("Sorgu çalıştırılırken bir hata oluştu: " + e.getMessage(), llmOutput);
            }
        } else {
            // Normal response if not SQL
            return new ChatbotResponse(llmOutput, null);
        }
    }

    private String callDeepSeek(String systemPrompt, String userMessage) {
        RestClient restClient = restClientBuilder.baseUrl(apiUrl).build();

        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ),
            "stream", false
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    if (message != null && message.containsKey("content")) {
                        return message.get("content").toString().trim();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error calling DeepSeek API", e);
            return "Üzgünüm, şu an bağlantı kuramıyorum. Hata: " + e.getMessage();
        }
        return "Bir hata oluştu.";
    }
}
