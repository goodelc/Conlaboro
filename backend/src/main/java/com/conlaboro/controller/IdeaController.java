package com.conlaboro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.conlaboro.common.Result;
import com.conlaboro.entity.Idea;
import com.conlaboro.service.IdeaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;

    @GetMapping
    public Result<Page<Idea>> getIdeasPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.ok(ideaService.getIdeasPage(page, size));
    }

    @PostMapping
    public Result<Idea> createIdea(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String authorName = body.get("authorName");
        return Result.ok(ideaService.createIdea(content, authorName));
    }

    @PostMapping("/{id}/like")
    public Result<Void> likeIdea(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        ideaService.likeIdea(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}/like")
    public Result<Void> unlikeIdea(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        ideaService.unlikeIdea(id, userId);
        return Result.ok();
    }

    @GetMapping("/{id}/liked")
    public Result<Boolean> hasLiked(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(ideaService.hasLiked(id, userId));
    }
}