package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String email;
    @TableField("password_hash")
    private String passwordHash;
    private String color;
    private String role;
    private Integer level;
    @TableField("level_name")
    private String levelName;
    private Integer xp;
    private Integer projectCount;
    @TableField("badge_count")
    private Integer badgeCount;
    @TableField("joined_at")
    private LocalDate joinedAt;
    private String bio;
    private LocalDateTime createdAt;
    @TableLogic
    private Integer deleted;
}
