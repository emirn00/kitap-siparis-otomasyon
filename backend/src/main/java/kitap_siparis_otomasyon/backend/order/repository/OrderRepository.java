package kitap_siparis_otomasyon.backend.order.repository;

import kitap_siparis_otomasyon.backend.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
