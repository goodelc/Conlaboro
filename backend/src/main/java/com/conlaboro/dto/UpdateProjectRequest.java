package com.conlaboro.dto;

import lombok.Data;

@Data
public class UpdateProjectRequest {
    private String title;
    private String description;
    private String category;     // app / ai / web / tool / game
    private Integer duration;    // 预计周期（天）
}
