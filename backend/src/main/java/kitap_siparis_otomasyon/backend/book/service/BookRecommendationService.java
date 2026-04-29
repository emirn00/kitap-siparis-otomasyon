package kitap_siparis_otomasyon.backend.book.service;

import kitap_siparis_otomasyon.backend.book.entity.Book;
import kitap_siparis_otomasyon.backend.book.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookRecommendationService {

    private final BookRepository bookRepository;

    public List<Book> getRecommendations(List<UUID> currentBookIds) {
        if (currentBookIds == null || currentBookIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Collaborative Filtering (Co-occurrence)
        List<Book> coOccurrenceRecs = bookRepository.findFrequentlyOrderedWith(currentBookIds, 10);
        
        // 2. Pattern Based Recommendations (Hueber Logic)
        List<Book> patternRecs = getPatternBasedRecommendations(currentBookIds);

        // Combine and Deduplicate
        Set<UUID> seenIds = new HashSet<>(currentBookIds);
        List<Book> combined = new ArrayList<>();
        
        // Priority 1: Patterns (Logical follow-ups)
        for (Book b : patternRecs) {
            if (seenIds.add(b.getId())) {
                combined.add(b);
            }
        }
        
        // Priority 2: Co-occurrence (Popular together)
        for (Book b : coOccurrenceRecs) {
            if (seenIds.add(b.getId())) {
                combined.add(b);
            }
        }

        return combined.stream().limit(6).collect(Collectors.toList());
    }

    private List<Book> getPatternBasedRecommendations(List<UUID> currentBookIds) {
        List<Book> currentBooks = bookRepository.findAllById(currentBookIds);
        if (currentBooks.isEmpty()) return Collections.emptyList();

        List<Book> allBooks = bookRepository.findAll();
        List<Book> recommendations = new ArrayList<>();

        for (Book current : currentBooks) {
            String name = current.getRequestName();
            String series = extractSeries(name);
            String level = extractLevel(name);
            String type = extractType(name);

            for (Book candidate : allBooks) {
                if (currentBookIds.contains(candidate.getId())) continue;
                
                String cName = candidate.getRequestName();
                String cSeries = extractSeries(cName);
                String cLevel = extractLevel(cName);
                String cType = extractType(cName);

                // Rule 1: Same series, same level, different type (Complementary)
                // e.g. Arbeitsbuch -> Kursbuch
                if (series.equals(cSeries) && level.equals(cLevel) && !type.equals(cType)) {
                    recommendations.add(candidate);
                }
                // Rule 2: Same series, next level
                // e.g. A1.1 -> A1.2
                else if (series.equals(cSeries) && isNextLevel(level, cLevel)) {
                    recommendations.add(candidate);
                }
            }
        }

        return recommendations;
    }

    private String extractSeries(String name) {
        // Assume series is the first two words if they exist, or just the first word
        String[] parts = name.split("\\s+");
        if (parts.length >= 2) {
            // Check if second part is a level like A1
            if (parts[1].matches("^[A-C][0-9].*")) {
                return parts[0];
            }
            return parts[0] + " " + parts[1];
        }
        return parts[0];
    }

    private String extractLevel(String name) {
        Pattern pattern = Pattern.compile("([A-C][0-9](\\.[0-9])?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(name);
        if (matcher.find()) {
            return matcher.group(1).toUpperCase();
        }
        return "";
    }

    private String extractType(String name) {
        if (name.toLowerCase().contains("arbeitsbuch")) return "Arbeitsbuch";
        if (name.toLowerCase().contains("kursbuch")) return "Kursbuch";
        if (name.toLowerCase().contains("lehrer")) return "Lehrerhandbuch";
        return "Other";
    }

    private boolean isNextLevel(String current, String candidate) {
        if (current.isEmpty() || candidate.isEmpty()) return false;
        // Simple sequential check for levels like A1.1 -> A1.2, A1.2 -> A2.1 etc.
        // This is a naive implementation but works for Hueber standards
        if (current.equals("A1.1") && candidate.equals("A1.2")) return true;
        if (current.equals("A1.2") && candidate.equals("A2.1")) return true;
        if (current.equals("A2.1") && candidate.equals("A2.2")) return true;
        if (current.equals("A2.2") && candidate.equals("B1.1")) return true;
        return false;
    }
}
