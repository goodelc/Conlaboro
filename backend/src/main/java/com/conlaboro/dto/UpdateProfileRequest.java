package com.conlaboro.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private List<String> skillNames;   // 技能名称列表，用于重建 user_skills
    private Map<String, Object> preferences;  // 用户偏好设置
}
