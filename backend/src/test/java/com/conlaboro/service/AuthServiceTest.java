package com.conlaboro.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("AuthService 单元测试")
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("服务正常注入")
    void serviceIsInjected() {
        assertNotNull(authService);
    }
}
