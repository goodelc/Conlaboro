package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("activities")
public class Activity {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    @TableField("user_id")
    private Long userId;
    @TableField("user_name")
    private String userName;
    @TableField("user_color")
    private String userColor;
    @TableField("action_type")
    private String actionType;
    @TableField("target_type")
    private String targetType;
    @TableField("target_id")
    private Long targetId;
    private String text;
    @TableField("xp_reward")
    private Integer xpReward;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}
