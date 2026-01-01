package kitap_siparis_otomasyon.backend.user.dto;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role
) {}

