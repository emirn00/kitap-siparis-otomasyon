package kitap_siparis_otomasyon.backend.chatbot.service;

import kitap_siparis_otomasyon.backend.chatbot.dto.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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

    private final Map<String, List<Map<String, String>>> conversationHistory = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_SIZE = 10;

    private static final String SQL_GEN_SYSTEM_PROMPT = """
            You are a backend assistant for a Bookstore Management System.
            
            RULES:
            1. ONLY generate SELECT queries for reading data.
            2. NEVER modify, delete, or drop data (No INSERT, UPDATE, DELETE, DROP).
            3. Always limit results to a maximum of 10 rows (LIMIT 10).
            4. Use ONLY the provided schema.
            5. If the question is not about the database or data, answer normally without SQL.
            6. If you generate a SQL query, wrap it STRICTLY in [SQL] tags. Example: [SQL] SELECT * FROM books [/SQL].
               DO NOT translate the tags [SQL] and [/SQL]. Ensure the SQL syntax is PERFECT.
            7. Use standard PostgreSQL syntax.
            8. CONTEXT: Use previous messages to resolve references like "this order", "that user", "his last book".
               If a user mentions "this" or "last", look at the previous database results or questions.

            SCHEMA:
            - Table "users": (id UUID, first_name VARCHAR, last_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR)
            - Table "books": (id UUID, request_name VARCHAR, order_name VARCHAR, isbn VARCHAR, lisencode_name VARCHAR)
            - Table "orders": (id UUID, user_id UUID, city VARCHAR, institution VARCHAR, created_at TIMESTAMP, status VARCHAR)
            - Table "order_books": (order_id UUID, book_id UUID) -- Join table connecting orders and books

            RELATIONSHIPS:
            - "orders" connects to "users" via "orders.user_id = users.id".
            - "orders" connects to "books" via the join table "order_books":
              "orders.id = order_books.order_id" AND "order_books.book_id = books.id".

            CURRENT CONTEXT:
            - Current Date and Time: %s
            - When user says "today" or "bugün", use the date above (compare created_at >= start of today).
            - When user says "this month" or "bu ay", use the month and year from the date above.
            - The system is in Turkish. Answer SQL in [SQL] tags.

            EXAMPLES:
            - Q: Who is user X? -> [SQL] SELECT * FROM users WHERE email = 'X' [/SQL]
            - Q: How many orders today? -> [SQL] SELECT count(*) FROM orders WHERE created_at >= '%s' [/SQL]
            - Q: En çok satan 5 kitap? -> [SQL] SELECT b.order_name, count(*) as sales FROM books b JOIN order_books ob ON b.id = ob.book_id GROUP BY b.id, b.order_name ORDER BY sales DESC LIMIT 5 [/SQL]
            """;

    private static final String SUMMARY_SYSTEM_PROMPT = """
            You are a highly capable Bookstore Business Analyst and Assistant. Your goal is to explain database results to the user with expertise and a friendly tone.
            
            DIRECTIONS:
            1. Use a conversational, professional, and helpful tone.
            2. Don't just list data; provide a brief "Expert Insight" if possible (e.g., "This book is performing exceptionally well this week").
            3. If the database results were empty, kindly inform the user and suggest what they might search for instead.
            4. NEVER mention technical terms like "SQL", "Table", "Database", or "Query".
            5. Use Markdown for formatting (bold, lists, tables) to make the data easy to read.
            6. Translate the data into natural, flowing Turkish sentences.
            7. If you use a table, keep it concise and follow it with a summarizing sentence.
            """;

    public ChatbotResponse processMessage(String userMessage, String sessionId) {
        String effectiveSessionId = (sessionId == null || sessionId.isBlank()) ? "default" : sessionId;
        
        // 1. Get History
        List<Map<String, String>> history = conversationHistory.computeIfAbsent(effectiveSessionId, k -> new ArrayList<>());

        // 2. SQL Generation Phase
        String currentDate = java.time.LocalDateTime.now().toString();
        String todayStart = java.time.LocalDate.now().atStartOfDay().toString();
        String dynamicSystemPrompt = String.format(SQL_GEN_SYSTEM_PROMPT, currentDate, todayStart);
        
        String llmOutput = callDeepSeek(dynamicSystemPrompt, userMessage, history);
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
                        
                    // 3. Summary Phase (No need for history here, just summarize current results)
                    String finalReply = callDeepSeek(SUMMARY_SYSTEM_PROMPT, summaryMessage, null);
                    
                    // 4. Update History with natural language interaction
                    updateHistory(effectiveSessionId, userMessage, finalReply);
                    
                    return new ChatbotResponse(finalReply, effectiveSessionId);
                } catch (Exception e) {
                    log.error("Database error while executing chatbot query: {}", sql, e);
                    return new ChatbotResponse("Veritabanına erişirken teknik bir sorun oluştu.", effectiveSessionId);
                }
            } else {
                log.warn("Invalid or suspicious SQL blocked: {}", sql);
                return new ChatbotResponse("Üzgünüm, isteğinizi anlayamadım veya veritabanı kurallarımıza uygun olmayan bir sorgu üretildi.", effectiveSessionId);
            }
        } else {
            if (looksLikeSql(llmOutput)) {
                log.warn("Hidden potential SQL leak: {}", llmOutput);
                return new ChatbotResponse("Cevap oluşturulurken teknik bir sorun oluştu, lütfen farklı bir şekilde sorun.", effectiveSessionId);
            }
            
            // Conversation without SQL
            updateHistory(effectiveSessionId, userMessage, llmOutput);
            return new ChatbotResponse(llmOutput, effectiveSessionId);
        }
    }

    private void updateHistory(String sessionId, String userMsg, String assistantMsg) {
        List<Map<String, String>> history = conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
        history.add(Map.of("role", "user", "content", userMsg));
        history.add(Map.of("role", "assistant", "content", assistantMsg));
        
        if (history.size() > MAX_HISTORY_SIZE * 2) {
            conversationHistory.put(sessionId, new ArrayList<>(history.subList(history.size() - (MAX_HISTORY_SIZE * 2), history.size())));
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

    private String callDeepSeek(String systemPrompt, String userMessage, List<Map<String, String>> history) {
        RestClient restClient = restClientBuilder.baseUrl(apiUrl).build();

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        
        if (history != null) {
            messages.addAll(history);
        }
        
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", messages,
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
