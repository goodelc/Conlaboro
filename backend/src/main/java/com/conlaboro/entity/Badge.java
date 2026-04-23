package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("badges")
public class Badge {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String icon;        // emoji
    private String name;
    private String series;      // 分类
    private String description;
    private String condition;
}
