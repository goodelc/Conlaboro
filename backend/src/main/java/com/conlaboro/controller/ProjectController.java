package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public Result<?> getAllProjects() {
        return Result.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> getDetail(@PathVariable Long id) {
        return Result.ok(projectService.getProjectDetail(id));
    }
}
