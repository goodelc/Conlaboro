package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("tasks")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long milestoneId;
    private String name;
    private String status;
    private String assignee;
    private Integer xp;
}
