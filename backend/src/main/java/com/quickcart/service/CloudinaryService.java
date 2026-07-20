package com.quickcart.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;

/**
 * Image storage service backed by Cloudinary.
 * Handles upload, delete, and image byte fetching for all roles:
 * users, store admins, delivery partners, and orders.
 */
@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Uploads a file to Cloudinary under the given folder and returns
     * the permanent, CDN-backed secure URL.
     *
     * @param file   the multipart file to upload
     * @param folder the Cloudinary folder path (e.g. "users/42", "stores/7/logo")
     * @return the secure HTTPS URL of the uploaded asset
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        byte[] bytes = file.getBytes();

        Map<?, ?> options = ObjectUtils.asMap(
                "folder",          folder,
                "resource_type",   "auto",
                "use_filename",    false,
                "unique_filename", true,
                "overwrite",       false
        );

        Map<?, ?> result = cloudinary.uploader().upload(bytes, options);
        return (String) result.get("secure_url");
    }

    /**
     * Deletes an asset from Cloudinary by its public ID.
     * The public ID is the path without file extension, e.g. "users/42/abc123".
     *
     * @param publicId the Cloudinary public ID of the asset to delete
     */
    public void deleteObject(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Downloads the raw bytes of an image from a Cloudinary URL.
     * Used by VisionService to feed image bytes to the Gemini Vision API.
     *
     * @param imageUrl the full Cloudinary HTTPS URL of the image
     * @return byte array of the image content
     */
    public byte[] downloadImageBytes(String imageUrl) {
        try {
            return restTemplate.getForObject(imageUrl, byte[].class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download image from Cloudinary URL: " + imageUrl, e);
        }
    }
}
