import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class AddMailedColumn {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/book_db";
        String user = "book_user";
        String password = "book_pass";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            String sql = "ALTER TABLE orders ADD COLUMN mailed BOOLEAN DEFAULT FALSE NOT NULL;";
            stmt.executeUpdate(sql);
            System.out.println("Column 'mailed' added successfully to 'orders' table.");
            
        } catch (Exception e) {
            System.err.println("Error adding column: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
