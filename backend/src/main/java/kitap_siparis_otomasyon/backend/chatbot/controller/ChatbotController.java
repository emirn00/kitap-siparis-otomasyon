package kitap_siparis_otomasyon.backend.chatbot.controller;

import kitap_siparis_otomasyon.backend.chatbot.dto.ChatbotRequest;
import kitap_siparis_otomasyon.backend.chatbot.dto.ChatbotResponse;
import kitap_siparis_otomasyon.backend.chatbot.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ChatbotResponse ask(@RequestBody ChatbotRequest request) {
        return chatbotService.processMessage(request.getMessage(), request.getSessionId());
    }
}
