package com.conlaboro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@TableName("applications")
public class Application {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    @TableField("applicant_id")
    private Long applicantId;
    @TableField("role_name")
    private String roleName;
    private String introduction;
    private String status;        // pending / approved / rejected
    @TableField("reviewed_by")
    private Long reviewedBy;
    @TableField("reviewed_at")
    private OffsetDateTime reviewedAt;
    @TableField("created_at")
    private OffsetDateTime createdAt;
}
