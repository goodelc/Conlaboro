package com.conlaboro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.conlaboro.common.Result;
import com.conlaboro.entity.Idea;
import com.conlaboro.service.IdeaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;

    @GetMapping
    public Result<Page<Idea>> getIdeasPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sortBy) {
        return Result.ok(ideaService.getIdeasPage(page, size, keyword, sortBy));
    }

    @GetMapping("/{id}")
    public Result<Idea> getIdeaById(@PathVariable Long id) {
        return Result.ok(ideaService.getIdeaById(id));
    }

    @PostMapping
    public Result<Idea> createIdea(
            @RequestBody Map<String, String> body,
            @RequestAttribute("userId") Long userId) {
        String content = body.get("content");
        String authorName = body.get("authorName");
        return Result.ok(ideaService.createIdea(content, authorName, userId));
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

    @GetMapping("/{id}/comments")
    public Result<List> getComments(
            @PathVariable Long id) {
        return Result.ok(ideaService.getCommentsByIdeaId(id));
    }

    @PostMapping("/{id}/comments")
    public Result createComment(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        return Result.ok(ideaService.createComment(id, userId, content));
    }

    // ========== 参与意愿相关端点 ==========

    @PostMapping("/{id}/interest")
    public Result<Void> expressInterest(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        ideaService.expressInterest(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}/interest")
    public Result<Void> cancelInterest(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        ideaService.cancelInterest(id, userId);
        return Result.ok();
    }

    @GetMapping("/{id}/interested-users")
    public Result<List<Map<String, Object>>> getInterestedUsers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {
        return Result.ok(ideaService.getInterestedUsers(id, limit));
    }

    @GetMapping("/{id}/interested")
    public Result<Boolean> hasExpressedInterest(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(ideaService.hasExpressedInterest(id, userId));
    }
}