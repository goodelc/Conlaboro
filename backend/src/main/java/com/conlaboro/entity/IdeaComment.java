package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("idea_comments")
public class IdeaComment {

    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("idea_id")
    private Long ideaId;
    @TableField("user_id")
    private Long userId;
    private String content;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}