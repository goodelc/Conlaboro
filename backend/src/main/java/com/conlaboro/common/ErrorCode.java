package com.conlaboro.common;

import lombok.Getter;

@Getter
public enum ErrorCode {

    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "数据冲突"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    // 业务错误码
    USER_ALREADY_EXISTS(1001, "用户已存在"),
    USER_NOT_FOUND(1002, "用户不存在"),
    INVALID_CREDENTIALS(1003, "用户名或密码错误"),
    PROJECT_NOT_FOUND(2001, "项目不存在"),
    BADGE_NOT_FOUND(3001, "徽章不存在"),
    BADGE_ALREADY_EARNED(3002, "徽章已获得"),
    APPLICATION_ALREADY_EXISTS(4001, "已申请过该项目"),
    APPLICATION_NOT_FOUND(4002, "申请不存在"),
    TASK_ALREADY_CLAIMED(5001, "任务已被认领"),
    FAVORITE_NOT_FOUND(6001, "收藏记录不存在");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
