package com.conlaboro.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AiConfig {
    private String apiKey;
    private String endpoint = "https://tokenhub.tencentmaas.com/v1/chat/completions";
    private String model = "deepseek-v4-pro";
    private Duration timeout = Duration.ofSeconds(30);
}
