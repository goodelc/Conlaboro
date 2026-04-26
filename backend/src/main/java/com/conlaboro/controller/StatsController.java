package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public Result<Map<String, Object>> getStats() {
        return Result.ok(statsService.getStats());
    }
}
