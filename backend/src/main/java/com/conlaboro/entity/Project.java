package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@TableName("projects")
public class Project {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private String status;       // open / progress / done
    private String category;     // app / ai / web / tool / game
    @TableField("author_id")
    private Long authorId;
    @TableField("author_name")
    private String authorName;
    @TableField("author_color")
    private String authorColor;
    @TableField("created_at")
    private LocalDate createdAt;
    private Integer duration;
    private String license;
    @TableField("total_hours")
    private Long totalHours;
    @TableField("total_commits")
    private Integer totalCommits;
    @TableField("completed_at")
    private LocalDate completedAt;
}
