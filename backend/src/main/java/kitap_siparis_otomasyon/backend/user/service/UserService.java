package kitap_siparis_otomasyon.backend.user.service;

import kitap_siparis_otomasyon.backend.user.dto.UpdateUserRequest;
import kitap_siparis_otomasyon.backend.user.dto.UserResponse;
import kitap_siparis_otomasyon.backend.user.entity.Role;
import kitap_siparis_otomasyon.backend.user.entity.User;
import kitap_siparis_otomasyon.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setRole(Role.valueOf(request.role()));

        return toResponse(userRepository.save(user));
    }

    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public UserResponse getCurrentUser(User user) {
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }
}

