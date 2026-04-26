package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.common.ErrorCode;
import com.conlaboro.dto.CreateProjectRequest;
import com.conlaboro.dto.CreateTaskRequest;
import com.conlaboro.dto.MilestoneRequest;
import com.conlaboro.dto.UpdateProjectRequest;
import com.conlaboro.entity.*;
import com.conlaboro.exception.BizException;
import com.conlaboro.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectRoleMapper roleMapper;
    private final MilestoneMapper milestoneMapper;
    private final TaskMapper taskMapper;
    private final CommentMapper commentMapper;
    private final FileMapper fileMapper;
    private final UserMapper userMapper;

    /** 创建项目（含角色和里程碑），事务操作 */
    @Transactional
    public Map<String, Object> createProject(CreateProjectRequest req, Long authorId) {
        User author = userMapper.selectById(authorId);
        if (author == null) throw new BizException(ErrorCode.USER_NOT_FOUND);

        // 1. 创建项目主体
        Project project = new Project();
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setStatus("open");
        project.setCategory(req.getCategory() != null ? req.getCategory() : "other");
        project.setAuthorId(authorId);
        project.setAuthorName(author.getName());
        project.setAuthorColor(author.getColor());
        project.setCreatedAt(LocalDate.now());
        project.setDuration(req.getDuration() != null ? req.getDuration() : 30);
        project.setLicense("MIT");
        projectMapper.insert(project);

        // 2. 创建角色
        if (req.getRoles() != null) {
            for (CreateProjectRequest.RoleConfig rc : req.getRoles()) {
                if (rc.getNeeded() != null && rc.getNeeded() > 0) {
                    ProjectRole pr = new ProjectRole();
                    pr.setProjectId(project.getId());
                    pr.setName(rc.getName());
                    pr.setEmoji(rc.getEmoji() != null ? rc.getEmoji() : "👤");
                    pr.setNeeded(rc.getNeeded());
                    pr.setFilled(0);
                    roleMapper.insert(pr);
                }
            }
        }

        // 3. 创建里程碑
        if (req.getMilestones() != null) {
            int order = 1;
            for (CreateProjectRequest.MilestoneConfig mc : req.getMilestones()) {
                Milestone ms = new Milestone();
                ms.setProjectId(project.getId());
                ms.setTitle(mc.getTitle());
                ms.setStatus(order == 1 ? "current" : "open");
                ms.setSortOrder(order++);
                milestoneMapper.insert(ms);
            }
        }

        // 返回完整详情
        return getProjectDetail(project.getId());
    }

    public Map<String, Object> getProjectDetail(Long id) {
        Project project = projectMapper.selectById(id);
        if (project == null) return null;

        Map<String, Object> result = new HashMap<>();
        result.put("project", project);
        result.put("roles", roleMapper.selectList(
                new LambdaQueryWrapper<ProjectRole>().eq(ProjectRole::getProjectId, id)));
        result.put("milestones", milestoneMapper.selectList(
                new LambdaQueryWrapper<Milestone>().eq(Milestone::getProjectId, id)
                        .orderByAsc(Milestone::getSortOrder)));

        List<Milestone> milestones = milestoneMapper.selectList(
                new LambdaQueryWrapper<Milestone>().eq(Milestone::getProjectId, id));
        if (!milestones.isEmpty()) {
            List<Long> msIds = milestones.stream().map(Milestone::getId).toList();
            result.put("tasks", taskMapper.selectList(
                    new LambdaQueryWrapper<Task>().in(Task::getMilestoneId, msIds)));
        }

        result.put("comments", commentMapper.selectList(
                new LambdaQueryWrapper<Comment>().eq(Comment::getProjectId, id)
                        .orderByDesc(Comment::getTime)));
        result.put("files", fileMapper.selectList(
                new LambdaQueryWrapper<FileEntity>().eq(FileEntity::getProjectId, id)));
        return result;
    }

    public List<Map<String, Object>> getAllProjects() {
        List<Project> projects = projectMapper.selectList(new LambdaQueryWrapper<Project>()
                .orderByDesc(Project::getCreatedAt));
        return projects.stream().map(project -> {
            Map<String, Object> item = new HashMap<>();
            item.put("project", project);
            item.put("roles", roleMapper.selectList(
                    new LambdaQueryWrapper<ProjectRole>().eq(ProjectRole::getProjectId, project.getId())));
            return item;
        }).toList();
    }

    /** 添加评论 */
    @Transactional
    public Comment addComment(Long projectId, String text, String userName, String userColor) {
        Comment comment = new Comment();
        comment.setProjectId(projectId);
        comment.setUserName(userName);
        comment.setUserColor(userColor);
        comment.setText(text);
        commentMapper.insert(comment);
        return comment;
    }

    /** 认领任务 */
    @Transactional
    public Task claimTask(Long taskId, String assigneeName) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new BizException(ErrorCode.NOT_FOUND);
        if (task.getAssignee() != null) {
            throw new BizException(ErrorCode.CONFLICT); // 已被认领
        }
        task.setAssignee(assigneeName);
        task.setStatus("progress");
        taskMapper.updateById(task);
        return task;
    }

    /** 释放/退回任务 */
    @Transactional
    public Task releaseTask(Long taskId, String assigneeName) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new BizException(ErrorCode.NOT_FOUND);
        if (!assigneeName.equals(task.getAssignee())) {
            throw new BizException(403, "只能释放自己认领的任务");
        }
        task.setAssignee(null);
        task.setStatus("open");
        taskMapper.updateById(task);
        return task;
    }

    /** 更新任务状态 */
    @Transactional
    public void updateTaskStatus(Long taskId, String status) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) throw new BizException(ErrorCode.NOT_FOUND);
        task.setStatus(status);
        if ("done".equals(status)) {
            task.setAssignee(null); // 完成后清除负责人
        }
        taskMapper.updateById(task);
    }

    /** 创建任务 */
    @Transactional
    public Task createTask(Long projectId, CreateTaskRequest req) {
        // 验证里程碑属于该项目
        Milestone ms = milestoneMapper.selectById(req.getMilestoneId());
        if (ms == null || !ms.getProjectId().equals(projectId)) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        Task task = new Task();
        task.setMilestoneId(req.getMilestoneId());
        task.setName(req.getName());
        task.setStatus("open");
        task.setXp(req.getXp() != null ? req.getXp() : 10);
        taskMapper.insert(task);
        return task;
    }

    /** 更新项目基本信息 */
    @Transactional
    public void updateProject(Long projectId, UpdateProjectRequest req, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) throw new BizException(ErrorCode.NOT_FOUND);
        // 只有发起人可以编辑
        if (!project.getAuthorId().equals(userId)) {
            throw new BizException(403, "只有项目发起人可以编辑项目信息");
        }
        if (req.getTitle() != null) project.setTitle(req.getTitle());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getCategory() != null) project.setCategory(req.getCategory());
        if (req.getDuration() != null) project.setDuration(req.getDuration());
        projectMapper.updateById(project);
    }

    /** 创建里程碑 */
    @Transactional
    public Milestone createMilestone(Long projectId, MilestoneRequest req) {
        // 计算当前最大 sortOrder
        var existing = milestoneMapper.selectList(
                new LambdaQueryWrapper<Milestone>().eq(Milestone::getProjectId, projectId));
        int nextOrder = existing.stream().mapToInt(m -> m.getSortOrder() != null ? m.getSortOrder() : 0).max().orElse(0) + 1;

        Milestone ms = new Milestone();
        ms.setProjectId(projectId);
        ms.setTitle(req.getTitle());
        ms.setStatus(existing.isEmpty() ? "current" : "open");
        ms.setSortOrder(nextOrder);
        milestoneMapper.insert(ms);
        return ms;
    }

    /** 更新里程碑 */
    @Transactional
    public void updateMilestone(Long milestoneId, MilestoneRequest req, Long userId) {
        Milestone ms = milestoneMapper.selectById(milestoneId);
        if (ms == null) throw new BizException(ErrorCode.NOT_FOUND);
        // 验证项目发起人
        Project project = projectMapper.selectById(ms.getProjectId());
        if (project == null || !project.getAuthorId().equals(userId)) {
            throw new BizException(403, "只有项目发起人可以编辑里程碑");
        }
        if (req.getTitle() != null) ms.setTitle(req.getTitle());
        milestoneMapper.updateById(ms);
    }

    /** 删除里程碑 */
    @Transactional
    public void deleteMilestone(Long milestoneId, Long userId) {
        Milestone ms = milestoneMapper.selectById(milestoneId);
        if (ms == null) throw new BizException(ErrorCode.NOT_FOUND);
        Project project = projectMapper.selectById(ms.getProjectId());
        if (project == null || !project.getAuthorId().equals(userId)) {
            throw new BizException(403, "只有项目发起人可以删除里程碑");
        }
        milestoneMapper.deleteById(milestoneId);
        // 同时删除关联任务
        taskMapper.delete(new LambdaQueryWrapper<Task>().eq(Task::getMilestoneId, milestoneId));
    }
}
