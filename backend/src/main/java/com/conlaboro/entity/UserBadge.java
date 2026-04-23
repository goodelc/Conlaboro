package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@TableName("user_badges")
public class UserBadge {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long badgeId;
    @TableField("earned_at")
    private LocalDate earnedAt;
}
