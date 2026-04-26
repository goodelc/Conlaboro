package com.conlaboro.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final LocalDateTime startTime = LocalDateTime.now();

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> application = new HashMap<>();
        application.put("name", "Conlaboro Backend");
        application.put("version", "1.0.0");
        application.put("status", "UP");
        application.put("startTime", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        application.put("uptime", getUptime());

        Map<String, Object> system = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        system.put("totalMemory", formatBytes(runtime.totalMemory()));
        system.put("freeMemory", formatBytes(runtime.freeMemory()));
        system.put("usedMemory", formatBytes(runtime.totalMemory() - runtime.freeMemory()));
        system.put("maxMemory", formatBytes(runtime.maxMemory()));
        system.put("availableProcessors", runtime.availableProcessors());

        Map<String, Object> database = checkDatabaseConnection();

        Map<String, Object> threads = new HashMap<>();
        ThreadGroup threadGroup = Thread.currentThread().getThreadGroup();
        while (threadGroup.getParent() != null) {
            threadGroup = threadGroup.getParent();
        }
        threads.put("activeCount", threadGroup.activeCount());
        threads.put("activeGroupCount", threadGroup.activeGroupCount());
        threads.put("maxPriority", threadGroup.getMaxPriority());

        response.put("status", "UP");
        response.put("application", application);
        response.put("system", system);
        response.put("database", database);
        response.put("threads", threads);
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health/simple")
    public ResponseEntity<Map<String, String>> healthSimple() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Service is running");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> checkDatabaseConnection() {
        Map<String, Object> dbInfo = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            dbInfo.put("status", "UP");
            dbInfo.put("databaseProductName", connection.getMetaData().getDatabaseProductName());
            dbInfo.put("databaseProductVersion", connection.getMetaData().getDatabaseProductVersion());
            dbInfo.put("driverName", connection.getMetaData().getDriverName());
            dbInfo.put("driverVersion", connection.getMetaData().getDriverVersion());
            dbInfo.put("url", connection.getMetaData().getURL());
            dbInfo.put("defaultCatalog", connection.getCatalog());
            dbInfo.put("defaultIsolation", connection.getTransactionIsolation());
            dbInfo.put("autoCommit", connection.getAutoCommit());
            dbInfo.put("readOnly", connection.isReadOnly());
        } catch (Exception e) {
            log.error("Database connection check failed", e);
            dbInfo.put("status", "DOWN");
            dbInfo.put("error", e.getMessage());
        }
        return dbInfo;
    }

    private String getUptime() {
        Duration duration = Duration.between(startTime, LocalDateTime.now());
        long days = duration.toDays();
        long hours = duration.toHoursPart();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        return String.format("%d days %02d:%02d:%02d", days, hours, minutes, seconds);
    }

    private String formatBytes(long bytes) {
        if (bytes < 0) {
            return "N/A";
        }
        long kb = bytes / 1024;
        long mb = kb / 1024;
        long gb = mb / 1024;
        if (gb > 0) {
            return String.format("%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
        } else if (mb > 0) {
            return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
        } else if (kb > 0) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else {
            return bytes + " B";
        }
    }
}
