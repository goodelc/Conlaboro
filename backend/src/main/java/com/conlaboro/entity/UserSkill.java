package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user_skills")
public class UserSkill {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String name;
    private Integer percentage;
    private LocalDateTime createdAt;
}
