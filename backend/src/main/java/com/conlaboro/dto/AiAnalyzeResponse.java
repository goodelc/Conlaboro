package com.conlaboro.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiAnalyzeResponse {
    private String name;
    private String tagline;
    private String category;
    private String duration;
    private List<RoleItem> roles;
    private List<MilestoneItem> milestones;
    private boolean fallback;  // 是否使用了降级方案

    @Data
    public static class RoleItem {
        private String emoji;
        private String name;
        private Integer needed;
        private String description;
    }

    @Data
    public static class MilestoneItem {
        private String title;
    }
}
