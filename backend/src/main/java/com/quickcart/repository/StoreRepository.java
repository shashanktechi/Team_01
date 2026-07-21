package com.quickcart.repository;

import com.quickcart.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerId(Long ownerId);

    /**
     * Nearest-store KNN query using PostGIS <-> distance operator.
     * Ordered by geography distance (metres) from the given point.
     * LIMIT is applied in-SQL via the :limit param.
     */
    @Query(value = """
            SELECT *
            FROM stores s
            WHERE s.is_open = true AND s.verification_status = 'APPROVED'
              AND s.location IS NOT NULL
            ORDER BY s.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
            LIMIT :limit
            """, nativeQuery = true)
    List<Store> findNearestStores(@Param("lat") double lat,
                                  @Param("lng") double lng,
                                  @Param("limit") int limit);

    /**
     * Stores within a given radius in metres using ST_DWithin on geography.
     */
    @Query(value = """
            SELECT *
            FROM stores s
            WHERE s.is_open = true AND s.verification_status = 'APPROVED'
              AND s.location IS NOT NULL
              AND ST_DWithin(s.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMetres)
            ORDER BY s.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
            """, nativeQuery = true)
    List<Store> findStoresWithinRadius(@Param("lat") double lat,
                                       @Param("lng") double lng,
                                       @Param("radiusMetres") double radiusMetres);

    List<Store> findByCityIgnoreCase(String city);

    List<Store> findByVerificationStatus(String verificationStatus);

    long countByVerificationStatus(String verificationStatus);
}

