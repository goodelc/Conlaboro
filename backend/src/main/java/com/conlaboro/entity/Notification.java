package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("notifications")
public class Notification {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String type;
    @TableField("type_icon")
    private String typeIcon;
    private String title;
    private String content;
    private String link;
    @TableField("is_read")
    private Boolean isRead;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}
