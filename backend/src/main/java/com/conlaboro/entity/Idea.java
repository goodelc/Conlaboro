package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("ideas")
public class Idea {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String content;
    @TableField("author_name")
    private String authorName;
    @TableField("user_id")
    private Long userId;
    @TableField("like_count")
    private Integer likeCount;
    @TableField("comment_count")
    private Integer commentCount;
    @TableField("created_at")
    private OffsetDateTime createdAt;
    @TableField("updated_at")
    private OffsetDateTime updatedAt;
}
