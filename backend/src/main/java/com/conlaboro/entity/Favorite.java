package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("favorites")
public class Favorite {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long projectId;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}
