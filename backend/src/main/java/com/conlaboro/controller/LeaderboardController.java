package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public Result<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(defaultValue = "xp") String sort) {
        return Result.ok(leaderboardService.getLeaderboard(sort));
    }
}
