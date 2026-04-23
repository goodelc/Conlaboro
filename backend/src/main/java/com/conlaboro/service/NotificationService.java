package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.conlaboro.entity.Notification;
import com.conlaboro.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    /**
     * 获取用户的通知列表（按时间倒序）
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationMapper.selectList(
                new LambdaQueryWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .orderByDesc(Notification::getCreatedAt));
    }

    /**
     * 获取用户未读通知数量
     */
    public Long getUnreadCount(Long userId) {
        return notificationMapper.selectCount(
                new LambdaQueryWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .eq(Notification::getIsRead, false));
    }

    /**
     * 标记单条为已读
     */
    public void markAsRead(Long notificationId, Long userId) {
        notificationMapper.update(null,
                new LambdaUpdateWrapper<Notification>()
                        .eq(Notification::getId, notificationId)
                        .eq(Notification::getUserId, userId)
                        .set(Notification::getIsRead, true));
    }

    /**
     * 标记所有通知为已读
     */
    public void markAllAsRead(Long userId) {
        notificationMapper.update(null,
                new LambdaUpdateWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .eq(Notification::getIsRead, false)
                        .set(Notification::getIsRead, true));
    }

    /**
     * 创建通知
     */
    public Notification create(Long userId, String type, String typeIcon,
                               String title, String content, String link) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTypeIcon(typeIcon);
        n.setTitle(title);
        n.setContent(content);
        n.setLink(link);
        n.setIsRead(false);
        notificationMapper.insert(n);
        return n;
    }
}
