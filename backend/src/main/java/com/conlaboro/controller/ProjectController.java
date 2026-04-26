package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.ApplyRequest;
import com.conlaboro.dto.CommentRequest;
import com.conlaboro.dto.CreateProjectRequest;
import com.conlaboro.dto.CreateTaskRequest;
import com.conlaboro.dto.MilestoneRequest;
import com.conlaboro.dto.UpdateProjectRequest;
import com.conlaboro.entity.Activity;
import com.conlaboro.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ApplicationService applicationService;
    private final ActivityService activityService;
    private final UserService userService;

    /** 创建项目 */
    @PostMapping
    public Result<Map<String, Object>> create(
            @Valid @RequestBody CreateProjectRequest req,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(projectService.createProject(req, userId));
    }

    /** 获取所有项目列表 */
    @GetMapping
    public Result<?> getAllProjects() {
        return Result.ok(projectService.getAllProjects());
    }

    /** 获取项目详情 */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getDetail(@PathVariable Long id) {
        return Result.ok(projectService.getProjectDetail(id));
    }

    /** 申请加入项目 */
    @PostMapping("/{id}/apply")
    public Result<?> applyJoin(
            @PathVariable Long id,
            @RequestBody ApplyRequest req,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(applicationService.apply(id, userId, req));
    }

    /** 获取项目的申请列表 */
    @GetMapping("/{id}/applications")
    public Result<List<?>> getApplications(@PathVariable Long id, @RequestAttribute("userId") Long userId) {
        applicationService.validateProjectOwner(id, userId);
        return Result.ok(applicationService.getProjectApplications(id));
    }

    /** 审批申请 */
    @PutMapping("/applications/{appId}/{action}")
    public Result<Void> reviewApplication(
            @PathVariable Long appId,
            @PathVariable String action,
            @RequestAttribute("userId") Long userId) {
        applicationService.validateReviewPermission(appId, userId);
        applicationService.review(appId, userId, action);
        return Result.ok(null);
    }

    /** 发送评论 */
    @PostMapping("/{id}/comments")
    public Result<?> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest req,
            @RequestAttribute("userId") Long userId) {
        var user = userService.getUserProfile(userId);
        String userName = (user != null && user.getName() != null) ? user.getName() : "用户" + userId;
        String userColor = (user != null) ? user.getColor() : "#999";
        var comment = projectService.addComment(id, req.getText(), userName, userColor);
        // 记录活动
        Activity activity = new Activity();
        activity.setProjectId(id);
        activity.setUserId(userId);
        activity.setUserName(comment.getUserName());
        activity.setUserColor(comment.getUserColor());
        activity.setActionType("commented");
        activity.setText("在项目中发表了评论");
        activityService.record(activity);
        return Result.ok(comment);
    }

    /* ── 任务操作 ── */

    /** 认领任务 */
    @PutMapping("/tasks/{taskId}/claim")
    public Result<?> claimTask(
            @PathVariable Long taskId,
            @RequestAttribute("userId") Long userId) {
        var user = userService.getUserProfile(userId);
        String userName = (user != null) ? user.getName() : "用户" + userId;
        return Result.ok(projectService.claimTask(taskId, userName));
    }

    /** 释放/退回任务 */
    @PutMapping("/tasks/{taskId}/release")
    public Result<?> releaseTask(
            @PathVariable Long taskId,
            @RequestAttribute("userId") Long userId) {
        var user = userService.getUserProfile(userId);
        String userName = (user != null) ? user.getName() : "用户" + userId;
        return Result.ok(projectService.releaseTask(taskId, userName));
    }

    /** 创建任务 */
    @PostMapping("/{projectId}/tasks")
    public Result<?> createTask(
            @PathVariable Long projectId,
            @RequestBody CreateTaskRequest req,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(projectService.createTask(projectId, req));
    }

    /** 编辑项目信息 */
    @PutMapping("/{id}")
    public Result<Void> updateProject(
            @PathVariable Long id,
            @RequestBody UpdateProjectRequest req,
            @RequestAttribute("userId") Long userId) {
        projectService.updateProject(id, req, userId);
        return Result.ok(null);
    }

    /* ── 里程碑操作 ── */

    /** 创建里程碑 */
    @PostMapping("/{projectId}/milestones")
    public Result<?> createMilestone(
            @PathVariable Long projectId,
            @RequestBody MilestoneRequest req,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(projectService.createMilestone(projectId, req));
    }

    /** 编辑里程碑 */
    @PutMapping("/milestones/{msId}")
    public Result<Void> updateMilestone(
            @PathVariable Long msId,
            @RequestBody MilestoneRequest req,
            @RequestAttribute("userId") Long userId) {
        projectService.updateMilestone(msId, req, userId);
        return Result.ok(null);
    }

    /** 删除里程碑 */
    @DeleteMapping("/milestones/{msId}")
    public Result<Void> deleteMilestone(
            @PathVariable Long msId,
            @RequestAttribute("userId") Long userId) {
        projectService.deleteMilestone(msId, userId);
        return Result.ok(null);
    }
}
