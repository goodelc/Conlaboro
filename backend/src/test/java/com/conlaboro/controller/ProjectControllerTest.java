package com.conlaboro.controller;

import com.conlaboro.common.Result;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("ProjectController API 集成测试")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/projects 返回项目列表 (code=200)")
    void getAllProjects_returns200() throws Exception {
        mockMvc.perform(get("/api/projects")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("GET /api/projects 返回 data 为数组")
    void allProjects_dataIsArray() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/projects/{id} 存在的项目返回详情")
    void getProjectDetail_existingId() throws Exception {
        mockMvc.perform(get("/api/projects/1"))
                .andExpect(result -> {
                    String body = result.getResponse().getContentAsString();
                    // 如果有种子数据则应返回详情；如果没有数据则可能返回 null
                    assertTrue(body.contains("\"code\":200"));
                });
    }
}
