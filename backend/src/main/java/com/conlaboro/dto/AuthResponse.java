package com.conlaboro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String token;
    private String color;
    private String role;
    private Integer level;
    private String levelName;
    private Integer xp;
    private Integer projectCount;
    private Integer badgeCount;
}