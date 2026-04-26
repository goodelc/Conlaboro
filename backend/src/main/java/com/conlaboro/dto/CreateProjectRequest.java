package com.conlaboro.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateProjectRequest {
    private String title;
    private String tagline;          // 一句话描述
    private String description;      // 详细描述
    private String category;         // app / web / game / ai / tool / other
    private Integer duration;        // 预计周期（天）
    private List<RoleConfig> roles;
    private List<MilestoneConfig> milestones;

    @Data
    public static class RoleConfig {
        private String name;
        private String emoji;
        private Integer needed;
    }

    @Data
    public static class MilestoneConfig {
        private String title;
    }
}
