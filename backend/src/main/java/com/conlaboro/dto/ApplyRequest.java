package com.conlaboro.dto;

import lombok.Data;

@Data
public class ApplyRequest {
    private String roleName;     // 申请的角色名称
    private String introduction;  // 自我介绍
}
