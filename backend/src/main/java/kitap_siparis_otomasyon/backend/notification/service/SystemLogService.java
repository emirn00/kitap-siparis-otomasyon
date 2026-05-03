package kitap_siparis_otomasyon.backend.notification.service;

import kitap_siparis_otomasyon.backend.notification.entity.SystemLog;
import kitap_siparis_otomasyon.backend.notification.repository.SystemLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SystemLogService {

    private final SystemLogRepository systemLogRepository;

    public SystemLogService(SystemLogRepository systemLogRepository) {
        this.systemLogRepository = systemLogRepository;
    }

    @Transactional
    public void log(String title, String message, SystemLog.LogType type) {
        SystemLog log = new SystemLog(title, message, type);
        systemLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<SystemLog> getAllLogs() {
        return systemLogRepository.findAll();
    }
}
