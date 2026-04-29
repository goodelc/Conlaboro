package com.conlaboro.service;

import com.conlaboro.config.AiConfig;
import com.conlaboro.dto.AiAnalyzeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AiConfig aiConfig;

    private static final String SYSTEM_PROMPT = """
        你是一个项目规划助手。用户会给你一个想法描述，你需要分析它并返回一个结构化的JSON。

        请严格按照以下JSON格式返回，不要包含任何其他文字：
        {
          "name": "项目名称（简洁有吸引力）",
          "tagline": "一句话介绍这个项目",
          "category": "app/web/game/ai/tool 之一",
          duration": "short/normal/long",
          "roles": [
            { "emoji": "emoji", "name": "角色名", "needed": 1, "description": "职责说明" }
          ],
          "milestones": [
            { "title": "阶段目标" }
          ]
        }

        要求：
        - name不超过10个字
        - tagline不超过30个字
        - roles建议3-5个角色
        - milestones建议3个阶段
        - 用通俗友好的语言，避免技术术语""";

    public AiAnalyzeResponse analyzeProjectIdea(String ideaContent) {
        try {
            return callDeepSeekApi(ideaContent);
        } catch (Exception e) {
            log.warn("AI调用失败，使用降级规则匹配: {}", e.getMessage());
            return fallbackAnalyze(ideaContent);
        }
    }

    private AiAnalyzeResponse callDeepSeekApi(String content) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(aiConfig.getApiKey());

        Map<String, String> systemMsg = Map.of("role", "system", "content", SYSTEM_PROMPT);
        Map<String, String> userMsg = Map.of("role", "user", "content", content);

        Map<String, Object> body = Map.of(
                "model", aiConfig.getModel(),
                "messages", List.of(systemMsg, userMsg),
                "stream", false
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                aiConfig.getEndpoint(),
                HttpMethod.POST,
                entity,
                Map.class,
                aiConfig.getTimeout()
        );

        if (response.getBody() == null || response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("AI API 返回异常: " + response.getStatusCode());
        }

        // 解析 OpenAI 兼容响应: choices[0].message.content
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("AI响应无choices字段");
        }

        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String rawContent = (String) message.get("content");
        
        return parseAiJson(rawContent, false);
    }

    /**
     * 降级方案：基于关键词的规则匹配
     */
    private AiAnalyzeResponse fallbackAnalyze(String content) {
        String lower = content.toLowerCase();
        
        String category = "app";
        if (lower.contains("app") || lower.contains("应用") || lower.contains("手机")) category = "app";
        else if (lower.contains("web") || lower.contains("网站") || lower.contains("平台")) category = "web";
        else if (lower.contains("游戏") || lower.contains("game")) category = "game";
        else if (lower.contains("ai") || lower.contains("人工智能") || lower.contains("智能")) category = "ai";
        else if (lower.contains("工具") || lower.contains("tool")) category = "tool";

        String name = content.length() > 15 ? content.substring(0, 15) + "..." : content;
        String tagline = "一个由社区驱动的创意项目";

        var roles = List.of(
                createRoleItem("\ud83c\udfaf", "\u4ea7\u54c1\u7ecf\u7406", 1, "\u5e2e\u5fd9\u6e05\u695a\u8981\u505a\u4ec0\u4e48"),
                createRoleItem("\ud83c\udfa8", "\u8bbe\u8ba1\u5e08", 1, "\u8bbe\u8ba1\u597d\u7528\u7684\u754c\u9762"),
                createRoleItem("\ud83d\udcbb", "\u524d\u7aef\u5f00\u53d1", 1, "\u505a\u51faApp\u754c\u9762"),
                createRoleItem("\u2699\ufe0f", "\u540e\u7aef\u5f00\u53d1", 1, "\u5904\u7406\u6570\u636e\u548c\u903b\u8f91")
        );

        var milestones = List.of(
                createMilestoneItem("\u8c03\u7814\u9700\u6c42\uff0c\u8bbe\u8ba1\u539f\u578b"),
                createMilestoneItem("\u5f00\u53d1\u6838\u5fc3\u529f\u80fd"),
                createMilestoneItem("\u6d4b\u8bd5\u4f18\u5316\uff0c\u4e0a\u7ebf")
        );

        var result = new AiAnalyzeResponse();
        result.setName(name);
        result.setTagline(tagline);
        result.setCategory(category);
        result.setDuration("normal");
        result.setRoles(roles);
        result.setMilestones(milestones);
        result.setFallback(true);
        return result;
    }

    private AiAnalyzeResponse.RoleItem createRoleItem(String emoji, String name, int needed, String desc) {
        var item = new AiAnalyzeResponse.RoleItem();
        item.setEmoji(emoji);
        item.setName(name);
        item.setNeeded(needed);
        item.setDescription(desc);
        return item;
    }

    private AiAnalyzeResponse.MilestoneItem createMilestoneItem(String title) {
        var item = new AiAnalyzeResponse.MilestoneItem();
        item.setTitle(title);
        return item;
    }

    @SuppressWarnings("unchecked")
    private AiAnalyzeResponse parseAiJson(String jsonStr, boolean isFallback) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = 
                    new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(jsonStr, Map.class);

            var resp = new AiAnalyzeResponse();
            resp.setName((String) map.getOrDefault("name", "\u65b0\u9879\u76ee"));
            resp.setTagline((String) map.getOrDefault("tagline", ""));
                        String cat = (String) map.getOrDefault("category", "app");
            // 确保不传非法值导致数据库约束违反
            if (!List.of("app", "web", "game", "ai", "tool").contains(cat)) {
                cat = "app";
            }
            resp.setCategory(cat);
            resp.setDuration((String) map.getOrDefault("duration", "normal"));
            resp.setFallback(isFallback);

            List<Map<String, Object>> roleMaps = (List<Map<String, Object>>) map.get("roles");
            if (roleMaps != null) {
                var roles = roleMaps.stream().map(r -> {
                    var ri = new AiAnalyzeResponse.RoleItem();
                    ri.setEmoji((String) r.getOrDefault("emoji", "\ud83d\udc64"));
                    ri.setName((String) r.getOrDefault("name", "\u6210\u5458"));
                    ri.setNeeded(r.containsKey("needed") ? ((Number) r.get("needed")).intValue() : 1);
                    ri.setDescription((String) r.getOrDefault("description", ""));
                    return ri;
                }).toList();
                resp.setRoles(roles);
            }

            List<Map<String, Object>> msMaps = (List<Map<String, Object>>) map.get("milestones");
            if (msMaps != null) {
                var milestones = msMaps.stream().map(m -> {
                    var mi = new AiAnalyzeResponse.MilestoneItem();
                    mi.setTitle((String) m.getOrDefault("title", "\u9636\u6bb5\u76ee\u6807"));
                    return mi;
                }).toList();
                resp.setMilestones(milestones);
            }
            return resp;
        } catch (Exception e) {
            log.warn("AI JSON解析失败，使用降级方案: {}", e.getMessage());
            return fallbackAnalyze(jsonStr);
        }
    }
}
