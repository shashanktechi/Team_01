package com.quickcart.service;

import com.quickcart.dto.response.WeatherSnapshot;
import com.quickcart.entity.Product;
import com.quickcart.entity.Store;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Objects;

@Service
public class WeatherAnalyticsService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherSnapshot getForecastForStore(Long storeId) {
        Store store = storeRepository.findById(Objects.requireNonNull(storeId))
                .orElseThrow(() -> new RuntimeException("Store not found"));

        double lat = 12.9716; // default fallback (Bengaluru)
        double lng = 77.5946; // default fallback
        if (store.getLocation() != null) {
            lng = store.getLocation().getX();
            lat = store.getLocation().getY();
        }

        try {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,precipitation_probability,weather_code", lat, lng);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(Objects.requireNonNull(url), Map.class);
            Map<?, ?> body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                Map<?, ?> current = (Map<?, ?>) body.get("current");
                if (current != null) {
                    Number temp = (Number) current.get("temperature_2m");
                    Number rainProb = (Number) current.get("precipitation_probability");
                    Number codeNum = (Number) current.get("weather_code");

                    double tempC = temp != null ? temp.doubleValue() : 25.0;
                    int rainProbability = rainProb != null ? rainProb.intValue() : 0;
                    int code = codeNum != null ? codeNum.intValue() : 0;

                    String condition = getWeatherConditionFromCode(code);
                    return new WeatherSnapshot(condition, tempC, rainProbability);
                }
            }
            return getSimulatedWeatherForecast();
        } catch (Exception e) {
            System.err.println("Open-Meteo API call failed: " + e.getMessage() + ". Falling back to simulated weather forecast.");
            return getSimulatedWeatherForecast();
        }
    }

    public double adjustDemandForWeather(Long productId, WeatherSnapshot weather) {
        Product product = productRepository.findById(Objects.requireNonNull(productId))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String category = product.getCategory() != null ? product.getCategory().toLowerCase() : "";
        String name = product.getName() != null ? product.getName().toLowerCase() : "";

        double multiplier = 1.0;

        if ("rainy".equalsIgnoreCase(weather.getCondition()) || "stormy".equalsIgnoreCase(weather.getCondition()) || weather.getRainProbability() > 50) {
            if (category.contains("umbrella") || name.contains("umbrella") || name.contains("raincoat")) {
                multiplier = 2.0; // 100% boost for umbrellas
            } else if (category.contains("food") || name.contains("noodle") || name.contains("instant")) {
                multiplier = 1.4; // 40% boost for instant food
            } else if (category.contains("beverage") || name.contains("tea") || name.contains("coffee") || name.contains("hot")) {
                multiplier = 1.3; // 30% boost for hot beverages
            }
        } else if ("clear".equalsIgnoreCase(weather.getCondition()) && weather.getTempC() > 30.0) {
            if (name.contains("ice cream") || name.contains("cold") || name.contains("soda") || category.contains("beverage")) {
                multiplier = 1.5; // 50% boost for cold items on hot days
            }
        }

        return multiplier;
    }

    private String getWeatherConditionFromCode(int code) {
        if (code == 0) return "Clear";
        if (code >= 1 && code <= 3) return "Cloudy";
        if (code == 45 || code == 48) return "Foggy";
        if (code >= 51 && code <= 67) return "Rainy";
        if (code >= 71 && code <= 77) return "Snowy";
        if (code >= 80 && code <= 82) return "Rainy";
        if (code >= 95 && code <= 99) return "Stormy";
        return "Unknown";
    }

    private WeatherSnapshot getSimulatedWeatherForecast() {
        return new WeatherSnapshot("Rainy", 22.5, 85);
    }
}
