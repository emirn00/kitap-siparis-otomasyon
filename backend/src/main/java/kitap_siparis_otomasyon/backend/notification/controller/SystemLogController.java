package kitap_siparis_otomasyon.backend.notification.controller;

import kitap_siparis_otomasyon.backend.notification.entity.SystemLog;
import kitap_siparis_otomasyon.backend.notification.service.SystemLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class SystemLogController {

    private final SystemLogService systemLogService;

    public SystemLogController(SystemLogService systemLogService) {
        this.systemLogService = systemLogService;
    }

    @GetMapping
    public ResponseEntity<List<SystemLog>> getAllLogs() {
        return ResponseEntity.ok(systemLogService.getAllLogs());
    }
}
