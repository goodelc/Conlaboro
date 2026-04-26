package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /** 收藏 / 取消收藏（切换） */
    @PutMapping("/{projectId}")
    public Result<Void> toggleFavorite(
            @PathVariable Long projectId,
            @RequestAttribute("userId") Long userId) {
        favoriteService.toggleFavorite(userId, projectId);
        return Result.ok(null);
    }

    /** 检查是否已收藏 */
    @GetMapping("/{projectId}")
    public Result<Boolean> isFavorited(
            @PathVariable Long projectId,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(favoriteService.isFavorited(userId, projectId));
    }
}
