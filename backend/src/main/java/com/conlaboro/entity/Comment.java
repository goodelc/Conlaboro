package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("comments")
public class Comment {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String userName;
    private String userColor;
    private String text;
    private OffsetDateTime time;
}
