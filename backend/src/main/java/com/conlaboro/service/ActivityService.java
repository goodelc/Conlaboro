package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Activity;
import com.conlaboro.mapper.ActivityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityMapper activityMapper;

    /** 记录一条活动 */
    public void record(Activity activity) {
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(OffsetDateTime.now());
        }
        activityMapper.insert(activity);
    }

    /** 获取用户的活动流 */
    public List<Activity> getUserActivities(Long userId, int limit) {
        return activityMapper.selectList(
                new LambdaQueryWrapper<Activity>()
                        .eq(Activity::getUserId, userId)
                        .orderByDesc(Activity::getCreatedAt)
                        .last("LIMIT " + Math.min(limit, 50)));
    }

    /** 获取项目的活动流 */
    public List<Activity> getProjectActivities(Long projectId, int limit) {
        return activityMapper.selectList(
                new LambdaQueryWrapper<Activity>()
                        .eq(Activity::getProjectId, projectId)
                        .orderByDesc(Activity::getCreatedAt)
                        .last("LIMIT " + Math.min(limit, 50)));
    }
}
