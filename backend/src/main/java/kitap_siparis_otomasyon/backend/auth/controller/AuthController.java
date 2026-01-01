package kitap_siparis_otomasyon.backend.auth.controller;

import jakarta.validation.Valid;
import kitap_siparis_otomasyon.backend.auth.dto.LoginRequest;
import kitap_siparis_otomasyon.backend.auth.dto.LoginResponse;
import kitap_siparis_otomasyon.backend.auth.dto.RegisterRequest;
import kitap_siparis_otomasyon.backend.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Login & Register operations")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
            summary = "Register new user",
            description = "Creates a new user with USER role by default"
    )
    @ApiResponse(
            responseCode = "201",
            description = "User registered successfully"
    )
    @ApiResponse(
            responseCode = "400",
            description = "Validation error"
    )
    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(
            summary = "Login",
            description = "Authenticates user and returns JWT token"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = LoginResponse.class)
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "Invalid email or password"
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Test endpoint",
            description = "Used to test if auth controller is reachable"
    )
    @GetMapping("/test")
    public String test() {
        return "OK";
    }
}
