package kitap_siparis_otomasyon.backend.auth.service;

import kitap_siparis_otomasyon.backend.auth.dto.LoginRequest;
import kitap_siparis_otomasyon.backend.auth.dto.LoginResponse;
import kitap_siparis_otomasyon.backend.auth.dto.RegisterRequest;
import kitap_siparis_otomasyon.backend.security.JwtService;
import kitap_siparis_otomasyon.backend.user.entity.Role;
import kitap_siparis_otomasyon.backend.user.entity.User;
import kitap_siparis_otomasyon.backend.user.repository.UserRepository;
import kitap_siparis_otomasyon.backend.notification.entity.SystemLog;
import kitap_siparis_otomasyon.backend.notification.service.SystemLogService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SystemLogService systemLogService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder , JwtService jwtService, SystemLogService systemLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.systemLogService = systemLogService;
    }

    public void register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already in use");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);


        userRepository.save(user);

        systemLogService.log(
                "Yeni Kullanıcı Kaydı",
                user.getFirstName() + " " + user.getLastName() + " (" + user.getEmail() + ") sisteme kayıt oldu.",
                SystemLog.LogType.USER_REGISTRATION
        );
    }


    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }


}

