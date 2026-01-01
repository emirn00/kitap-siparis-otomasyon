package kitap_siparis_otomasyon.backend.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kitap_siparis_otomasyon.backend.user.dto.UpdateUserRequest;
import kitap_siparis_otomasyon.backend.user.dto.UserResponse;
import kitap_siparis_otomasyon.backend.user.entity.User;
import kitap_siparis_otomasyon.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Users", description = "User management endpoints")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get all users (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAll();
    }

    @Operation(summary = "Get user by id (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable UUID id) {
        return userService.getById(id);
    }

    @Operation(summary = "Update user (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request
    ) {
        return userService.update(id, request);
    }

    @Operation(summary = "Delete user (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        userService.delete(id);
    }

    @Operation(summary = "Get current logged-in user")
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return userService.getCurrentUser(user);
    }
}

