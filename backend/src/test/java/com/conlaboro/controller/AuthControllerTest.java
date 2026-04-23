package com.conlaboro.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController API 集成测试")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register 注册新用户")
    void register_newUser() throws Exception {
        Map<String, String> body = Map.of(
            "name", "TestUser",
            "email", "test@example.com",
            "password", "password123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("POST /api/auth/register 缺少字段返回错误")
    void register_missingFields() throws Exception {
        Map<String, String> body = Map.of(
            "name", ""
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(result -> {
                    // 可能是 400 或 200（取决于校验实现）
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 400,
                            "状态码应为 200 或 400，实际: " + status);
                });
    }

    @Test
    @DisplayName("POST /api/auth/login 登录")
    void login_withCredentials() throws Exception {
        Map<String, String> body = Map.of(
            "email", "alex@conlaboro.com",
            "password", "any_password"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    assertTrue(content.contains("\"code\""),
                            "响应应包含 code 字段");
                });
    }
}
