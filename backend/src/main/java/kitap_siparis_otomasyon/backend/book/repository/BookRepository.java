package kitap_siparis_otomasyon.backend.book.repository;

import kitap_siparis_otomasyon.backend.book.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {
    org.springframework.data.domain.Page<Book> findByRequestNameContainingIgnoreCaseOrIsbnContainingIgnoreCase(
            String requestName, String isbn, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = """
        SELECT b.* FROM books b
        JOIN order_books ob ON b.id = ob.book_id
        WHERE ob.order_id IN (
            SELECT order_id FROM order_books WHERE book_id IN :bookIds
        )
        AND b.id NOT IN :bookIds
        GROUP BY b.id
        ORDER BY COUNT(*) DESC
        LIMIT :limit
        """, nativeQuery = true)
    java.util.List<Book> findFrequentlyOrderedWith(@org.springframework.data.repository.query.Param("bookIds") java.util.List<java.util.UUID> bookIds, @org.springframework.data.repository.query.Param("limit") int limit);
}
