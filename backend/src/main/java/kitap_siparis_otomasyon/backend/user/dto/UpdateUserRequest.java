package kitap_siparis_otomasyon.backend.user.dto;

public record UpdateUserRequest(
        String firstName,
        String lastName,
        String phone,
        String role
) {}

