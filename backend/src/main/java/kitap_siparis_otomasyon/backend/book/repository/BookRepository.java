package kitap_siparis_otomasyon.backend.book.repository;

import kitap_siparis_otomasyon.backend.book.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {
    org.springframework.data.domain.Page<Book> findByRequestNameContainingIgnoreCaseOrIsbnContainingIgnoreCase(
            String requestName, String isbn, org.springframework.data.domain.Pageable pageable);
}
