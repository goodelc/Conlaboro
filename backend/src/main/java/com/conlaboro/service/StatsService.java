package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Project;
import com.conlaboro.mapper.ProjectMapper;
import com.conlaboro.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserMapper userMapper;
    private final ProjectMapper projectMapper;

    public Map<String, Object> getStats() {
        long totalUsers = userMapper.selectCount(null);
        long totalProjects = projectMapper.selectCount(null);
        long doneProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>().eq(Project::getStatus, "done"));
        long openProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>().eq(Project::getStatus, "open"));
        long progressProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>().eq(Project::getStatus, "progress"));

        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers", totalUsers);
        result.put("totalProjects", totalProjects);
        result.put("doneProjects", doneProjects);
        result.put("openProjects", openProjects);
        result.put("progressProjects", progressProjects);
        return result;
    }
}
