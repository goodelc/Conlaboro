package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.entity.Activity;
import com.conlaboro.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    /** 获取当前用户的活动流（贡献记录） */
    @GetMapping
    public Result<List<Activity>> myActivities(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "20") int limit) {
        return Result.ok(activityService.getUserActivities(userId, limit));
    }

    /** 获取指定项目活动流 */
    @GetMapping("/project/{projectId}")
    public Result<List<Activity>> projectActivities(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "30") int limit) {
        return Result.ok(activityService.getProjectActivities(projectId, limit));
    }
}
