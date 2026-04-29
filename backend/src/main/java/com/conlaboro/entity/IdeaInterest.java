package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("idea_interests")
public class IdeaInterest {

    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("idea_id")
    private Long ideaId;
    @TableField("user_id")
    private Long userId;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}
