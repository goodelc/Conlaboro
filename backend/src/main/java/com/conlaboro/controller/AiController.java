package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.AiAnalyzeRequest;
import com.conlaboro.dto.AiAnalyzeResponse;
import com.conlaboro.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AIService aiService;

    @PostMapping("/analyze-project")
    public Result<AiAnalyzeResponse> analyzeProject(
            @RequestBody AiAnalyzeRequest request,
            @RequestAttribute("userId") Long userId) {
        return Result.ok(aiService.analyzeProjectIdea(request.getContent()));
    }
}
