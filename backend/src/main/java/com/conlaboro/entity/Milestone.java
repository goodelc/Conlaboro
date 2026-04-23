package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@TableName("milestones")
public class Milestone {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String title;
    private String status;
    private LocalDate date;
    @TableField("sort_order")
    private Integer sortOrder;
}
