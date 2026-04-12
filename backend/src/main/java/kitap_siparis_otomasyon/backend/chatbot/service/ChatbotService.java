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
            You are a backend assistant for a Bookstore Management System.
            
            RULES:
            1. ONLY generate SELECT queries for reading data.
            2. NEVER modify, delete, or drop data (No INSERT, UPDATE, DELETE, DROP).
            3. Always limit results to a maximum of 10 rows (LIMIT 10).
            4. Use ONLY the provided schema.
            5. If the question is not about the database or data, answer normally without SQL.
            6. If you generate a SQL query, wrap it STRICTLY in [SQL] tags. Example: [SQL] SELECT * FROM books [/SQL].
               DO NOT translate the tags [SQL] and [/SQL]. Ensure the SQL syntax is PERFECT (no typos like SELECET).
            7. Use standard PostgreSQL syntax.

            SCHEMA:
            - Table "users": (id UUID, first_name VARCHAR, last_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR)
            - Table "books": (id UUID, request_name VARCHAR, order_name VARCHAR, isbn VARCHAR, lisencode_name VARCHAR)
            - Table "orders": (id UUID, user_id UUID, city VARCHAR, institution VARCHAR, created_at TIMESTAMP, status VARCHAR)
            - Table "order_books": (order_id UUID, book_id UUID) -- Join table connecting orders and books

            RELATIONSHIPS:
            - "orders" connects to "users" via "orders.user_id = users.id".
            - "orders" connects to "books" via the join table "order_books":
              "orders.id = order_books.order_id" AND "order_books.book_id = books.id".

            EXAMPLES:
            - Q: How many books are there? -> [SQL] SELECT COUNT(*) FROM books [/SQL]
            - Q: Last 5 orders with user names? -> [SQL] SELECT o.id, u.first_name, u.last_name, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5 [/SQL]
            - Q: Which book is ordered the most? -> [SQL] SELECT b.order_name, COUNT(ob.book_id) as order_count FROM books b JOIN order_books ob ON b.id = ob.book_id GROUP BY b.id, b.order_name ORDER BY order_count DESC LIMIT 1 [/SQL]
            """;

    private static final String SUMMARY_SYSTEM_PROMPT = """
            You are a friendly Bookstore Assistant. Your goal is to explain database results to the user.
            
            DIRECTIONS:
            1. Use a conversational and helpful tone.
            2. Explain the numbers or data list simply.
            3. If the database results were empty, kindly inform the user that no records were found matching their request.
            4. NEVER mention SQL queries, table names, or technical execution details in your response.
            5. Translate data into natural language sentences.
            """;

    public ChatbotResponse processMessage(String userMessage) {
        String llmOutput = callDeepSeek(SQL_GEN_SYSTEM_PROMPT, userMessage);
        String sql = extractSql(llmOutput);
        
        if (sql != null) {
            if (isValidSelectQuery(sql)) {
                log.info("Extracted and Validated SQL: {}", sql);
                try {
                    List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
                    
                    String summaryMessage = String.format("""
                        User Question: %s
                        Database Results: %s
                        """, userMessage, results.toString());
                        
                    String finalReply = callDeepSeek(SUMMARY_SYSTEM_PROMPT, summaryMessage);
                    return new ChatbotResponse(finalReply, null);
                } catch (Exception e) {
                    log.error("Database error while executing chatbot query: {}", sql, e);
                    return new ChatbotResponse("Veritabanına erişirken teknik bir sorun oluştu.", null);
                }
            } else {
                // If it looks like SQL but isn't valid/safe, don't return the raw llmOutput!
                log.warn("Invalid or suspicious SQL blocked: {}", sql);
                return new ChatbotResponse("Üzgünüm, isteğinizi anlayamadım veya veritabanı kurallarımıza uygun olmayan bir sorgu üretildi.", null);
            }
        } else {
            // Safety check: even if no tags were found, if the message contains keywords, hide it
            if (looksLikeSql(llmOutput)) {
                log.warn("Hidden potential SQL leak: {}", llmOutput);
                return new ChatbotResponse("Cevap oluşturulurken teknik bir sorun oluştu, lütfen farklı bir şekilde sorun.", null);
            }
            return new ChatbotResponse(llmOutput, null);
        }
    }

    private boolean looksLikeSql(String text) {
        String upper = text.toUpperCase();
        return upper.contains("SELECT") || upper.contains("FROM") || upper.contains("SELECET") || upper.contains("COUNT(*)");
    }

    private String extractSql(String text) {
        // Regex to find content between [SQL] or [Sorgu] tags (case-insensitive)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "\\[(SQL|SORGU)\\](.*?)\\[\\/(SQL|SORGU)\\]", 
            java.util.regex.Pattern.CASE_INSENSITIVE | java.util.regex.Pattern.DOTALL
        );
        java.util.regex.Matcher matcher = pattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        
        // Final fallback: check for any bracketed SELECT-like statement
        java.util.regex.Pattern bracketPattern = java.util.regex.Pattern.compile("\\[(SELECT.*?)\\]", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher bracketMatcher = bracketPattern.matcher(text);
        if (bracketMatcher.find()) {
            return bracketMatcher.group(1).trim();
        }

        if (text.trim().toUpperCase().startsWith("SELECT")) {
            return text.trim();
        }
        
        return null;
    }

    private boolean isValidSelectQuery(String sql) {
        // Handle typos like SELECET and remove leading non-alphabetic chars
        String normalizedSql = sql.replaceAll("^[^A-Za-z]+", "").trim().toUpperCase();
        
        if (normalizedSql.startsWith("SELECET")) {
            normalizedSql = normalizedSql.replace("SELECET", "SELECT");
        }

        if (!normalizedSql.startsWith("SELECT")) {
            return false;
        }
        
        String[] restrictedKeywords = {"INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT"};
        for (String keyword : restrictedKeywords) {
            // Use regex for full word match to avoid blocking columns like 'created_at' or 'updated_at'
            String regex = "\\b" + keyword + "\\b";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
            if (p.matcher(normalizedSql).find()) {
                return false;
            }
        }
        
        String[] allowedTables = {"users", "books", "orders", "order_books"};
        boolean mentionsAllowedTable = false;
        for (String table : allowedTables) {
            if (normalizedSql.contains(table.toUpperCase())) {
                mentionsAllowedTable = true;
                break;
            }
        }
        
        return mentionsAllowedTable;
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
