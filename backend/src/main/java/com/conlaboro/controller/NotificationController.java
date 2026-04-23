package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.entity.Notification;
import com.conlaboro.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 获取当前用户的通知列表
     */
    @GetMapping
    public Result<List<Notification>> list(
            @RequestAttribute("userId") Long userId) {
        return Result.ok(notificationService.getUserNotifications(userId));
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Long> unreadCount(
            @RequestAttribute("userId") Long userId) {
        return Result.ok(notificationService.getUnreadCount(userId));
    }

    /**
     * 标记单条为已读
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        notificationService.markAsRead(id, userId);
        return Result.ok(null);
    }

    /**
     * 全部标为已读
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead(
            @RequestAttribute("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return Result.ok(null);
    }
}
