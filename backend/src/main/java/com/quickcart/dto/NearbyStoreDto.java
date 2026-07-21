package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Projection returned by /api/public/stores/nearby.
 * Includes all core store fields plus the calculated distance in metres.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NearbyStoreDto {
    private Long id;
    private String name;
    private String city;
    private String address;
    private String verificationStatus;
    private Boolean isOpen;
    private String logoUrl;
    private String bannerUrl;
    private String whatsappNumber;
    private Double freshnessScore;
    /** Latitude of the store (extracted from the Point geometry). */
    private Double lat;
    /** Longitude of the store (extracted from the Point geometry). */
    private Double lng;
    /**
     * Straight-line distance from the queried coordinate to this store,
     * in kilometres (computed client-side via Haversine for now; can be
     * replaced by ST_Distance from PostGIS once store locations are populated).
     */
    private Double distanceKm;
}
