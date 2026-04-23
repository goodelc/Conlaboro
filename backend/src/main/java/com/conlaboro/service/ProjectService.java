package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.*;
import com.conlaboro.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
