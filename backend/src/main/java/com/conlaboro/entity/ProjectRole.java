package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("project_roles")
public class ProjectRole {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String name;
    private String emoji;
    private Integer needed;
    private Integer filled;
}
