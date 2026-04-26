package com.conlaboro.dto;

import lombok.Data;

@Data
public class CreateTaskRequest {
    private Long milestoneId;
    private String name;
    private Integer xp;        // 经验值奖励
}
