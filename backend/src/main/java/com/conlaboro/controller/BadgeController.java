package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.entity.Badge;
import com.conlaboro.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public Result<List<Badge>> getAllBadges() {
        return Result.ok(badgeService.getAllBadges());
    }

    @GetMapping("/mine")
    public Result<List<Badge>> getMyBadges(@RequestParam(required = false) Long userId) {
        if (userId == null) {
            return Result.ok(badgeService.getAllBadges());
        }
        return Result.ok(badgeService.getBadgesWithEarnStatus(userId));
    }
}
