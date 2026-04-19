package kitap_siparis_otomasyon.backend.order.controller;

import kitap_siparis_otomasyon.backend.order.dto.OrderResponse;
import kitap_siparis_otomasyon.backend.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders/mail")
public class OrderMailController {

    private final OrderService orderService;

    public OrderMailController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/ready")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getMailReadyOrders() {
        return ResponseEntity.ok(orderService.getMailReadyOrders());
    }

    @PostMapping("/send/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendOrderCodesEmail(@PathVariable UUID id) {
        orderService.sendOrderCodesEmail(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preview/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getMailPreview(@PathVariable UUID id) {
        OrderResponse order = orderService.getOrderById(id);
        
        Map<String, String> preview = new HashMap<>();
        preview.put("to", order.getEmail());
        preview.put("subject", "Kitap Siparişiniz - İnteraktif Aktivasyon Kodları");
        
        StringBuilder sb = new StringBuilder();
        sb.append("Merhaba ").append(order.getUserName()).append(",\n\n");
        sb.append("Sipariş ettiğiniz dijital kitapların aktivasyon kodları aşağıdadır:\n\n");
        
        order.getBooks().forEach(b -> {
            sb.append("- ").append(b.getRequestName())
              .append(": ").append(b.getInteractiveCode() != null ? b.getInteractiveCode() : "Hata")
              .append("\n");
        });
        
        sb.append("\nİyi çalışmalar dileriz.");
        preview.put("body", sb.toString());
        
        return ResponseEntity.ok(preview);
    }
}
