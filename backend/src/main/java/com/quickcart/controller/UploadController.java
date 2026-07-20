package com.quickcart.controller;

import com.quickcart.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            String fileUrl = cloudinaryService.uploadFile(file, folder);
            return ResponseEntity.ok(Map.of("url", fileUrl));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }
}
