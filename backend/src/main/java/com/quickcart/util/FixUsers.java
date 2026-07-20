package com.quickcart.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixUsers {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres", "admin123", "Sunny2005");
            Statement stmt = conn.createStatement();
            
            // Delete STORE_ADMIN users who do not have a store
            int deletedAdmins = stmt.executeUpdate("DELETE FROM users WHERE role = 'STORE_ADMIN' AND id NOT IN (SELECT owner_id FROM stores)");
            System.out.println("Deleted " + deletedAdmins + " orphaned STORE_ADMIN users.");

            // Set all DELIVERY_PARTNER users to APPROVED (just in case)
            int approvedPartners = stmt.executeUpdate("UPDATE users SET verification_status = 'APPROVED', is_active = true WHERE role = 'DELIVERY_PARTNER'");
            System.out.println("Approved " + approvedPartners + " DELIVERY_PARTNER users.");
            
            stmt.close();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
