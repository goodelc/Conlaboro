package com.conlaboro.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiAnalyzeResponse {
    private String analysis;       // AI分析报告（结构化文本）
    private String name;
    private String tagline;
    private String category;
    private String duration;
    private List<RoleItem> roles;
    private List<MilestoneItem> milestones;
    private Integer feasibilityScore; // 可行性评分 1-5
    private String techStack;         // 技术栈建议（JSON字符串数组）
    private String targetUsers;       // 目标用户画像描述
    private String coreFeatures;      // 核心功能列表（JSON字符串数组）
    private String competitiveAdvantage; // 竞争优势（JSON字符串数组）
    private String monetization;      // 商业模式建议（JSON字符串数组）
    private String riskMitigation;    // 风险应对策略（JSON字符串数组）
    private String userScenario;      // 典型使用场景描述
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
        private String description; // 阶段描述
        private String deliverable;  // 交付物
    }
}
