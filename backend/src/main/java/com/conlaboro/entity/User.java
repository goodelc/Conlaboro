package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.conlaboro.config.JsonbTypeHandler;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
@TableName(value = "users", autoResultMap = true)
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
    @TableField(value = "preferences", typeHandler = JsonbTypeHandler.class)
    private Map<String, Object> preferences;
    @TableField("avatar_url")
    private String avatarUrl;
    private OffsetDateTime createdAt;
    @TableLogic
    private Integer deleted;
}
