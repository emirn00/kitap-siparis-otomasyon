package kitap_siparis_otomasyon.backend.auth.controller;

import jakarta.validation.Valid;
import kitap_siparis_otomasyon.backend.auth.dto.LoginRequest;
import kitap_siparis_otomasyon.backend.auth.dto.LoginResponse;
import kitap_siparis_otomasyon.backend.auth.dto.RegisterRequest;
import kitap_siparis_otomasyon.backend.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/test")
    public String test() {
        return "OK";
    }


}
