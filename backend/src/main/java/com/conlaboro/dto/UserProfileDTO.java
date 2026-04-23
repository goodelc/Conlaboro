package com.conlaboro.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String color;
    private String role;
    private Integer level;
    private String levelName;
    private Integer xp;
    private Integer projectCount;
    private Integer badgeCount;
    private LocalDate joinedAt;
    private String bio;
    private List<SkillDTO> skills;
    private List<Long> earnedBadgeIds;
}
