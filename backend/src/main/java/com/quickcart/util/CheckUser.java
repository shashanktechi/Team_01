package com.quickcart.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUser {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres", "admin123", "Sunny2005");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, email, role, verification_status, is_active FROM users");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + " | " + rs.getString("email") + " | " + rs.getString("role") + " | " + rs.getString("verification_status") + " | " + rs.getBoolean("is_active"));
            }
            rs.close();
            stmt.close();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
