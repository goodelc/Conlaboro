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
        你是一个资深的项目规划顾问。用户会给你一个想法描述，你需要深入分析这个想法，并返回结构化结果。

        请严格按照以下JSON格式返回，不要包含任何其他文字：
        {
          "analysis": {
            "summary": "用2-3句话概括你对这个项目的核心理解，说明它要做什么、为谁解决问题",
            "highlights": ["亮点1：具体描述创新点或差异化优势", "亮点2：...", "亮点3：..."],
            "suggestions": ["建议1：可以补充或优化的方向", "建议2：...", "建议3：..."],
            "risks": ["风险1：可能遇到的挑战或注意事项", "风险2：..."]
          },
          "feasibilityScore": 4,
          "techStack": ["技术1", "技术2", "技术3"],
          "targetUsers": "用1-2句话描述这个项目的目标用户群体，包括他们的特征和需求",
          "name": "项目名称（简洁有吸引力，不超过10个字）",
          "tagline": "一句话介绍这个项目（不超过30个字）",
          "category": "app/web/game/ai/tool 之一",
          "duration": "short/normal/long",
          "roles": [
            { "emoji": "emoji", "name": "角色名", "needed": 1, "description": "职责说明" }
          ],
          "milestones": [
            { "title": "阶段目标" }
          ]
        }

        分析要求：
        - summary 要体现你真正理解了用户的想法核心，不要泛泛而谈
        - highlights 挖掘项目的独特价值、市场机会或技术创新点
        - suggestions 给出具体的、可执行的建议（如功能补充、目标用户细化、技术选型等）
        - risks 提示实际可能遇到的困难（技术难度、市场竞争、资源需求等）
        - feasibilityScore 是1-5的整数评分：1=非常困难 2=较困难 3=一般 4=较可行 5=非常可行，综合考虑技术难度、市场时机、资源需求
        - techStack 推荐3-6个最相关的技术/框架/工具，要具体（如"React"而非"前端框架"）
        - targetUsers 用简洁语言描述目标用户画像，包括用户特征和使用场景
        - 用通俗友好的中文，避免空话套话
        - roles 建议3-5个角色
        - milestones 建议3个阶段""";

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

        // 生成简化的分析文本（JSON格式，与AI返回的analysis结构一致）
        StringBuilder summary = new StringBuilder("这是一个");
        if (category.equals("app")) summary.append("移动应用类项目，目标是为用户提供便捷的移动端体验。");
        else if (category.equals("web")) summary.append("Web应用类项目，致力于打造优秀的在线服务平台。");
        else if (category.equals("game")) summary.append("游戏类项目，旨在为玩家带来有趣的游戏体验。");
        else if (category.equals("ai")) summary.append("AI/机器学习类项目，探索智能化解决方案的可能性。");
        else summary.append("工具类项目，专注于解决特定场景下的效率问题。");

        String analysisJson = String.format(
            "{\"summary\":\"%s\",\"highlights\":[\"想法具有明确的用户价值导向\",\"可以作为团队协作的起点\"],\"suggestions\":[\"进一步明确目标用户群体\",\"梳理核心功能优先级\",\"考虑技术实现的可行性\"],\"risks\":[\"需要验证市场需求\",\"资源协调可能存在挑战\"]}",
            summary
        );

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
        result.setAnalysis(analysisJson);
        result.setName(name);
        result.setTagline(tagline);
        result.setCategory(category);
        result.setDuration("normal");
        result.setFeasibilityScore(3);
        result.setTechStack("[\"React\",\"Node.js\",\"PostgreSQL\"]");
        result.setTargetUsers("对协作和创新感兴趣的开发者和创作者");
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
            // 剥离 AI 返回中可能存在的 markdown 代码块包裹
            String cleaned = jsonStr.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```(?:json)?\\s*\\n?", "")
                                 .replaceAll("\\n?```\\s*$", "");
            }
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = 
                    new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(cleaned, Map.class);

            var resp = new AiAnalyzeResponse();

            // 解析 analysis 嵌套对象，序列化为JSON字符串传给前端
            Map<String, Object> analysisMap = (Map<String, Object>) map.get("analysis");
            if (analysisMap != null) {
                try {
                    resp.setAnalysis(mapper.writeValueAsString(analysisMap));
                } catch (Exception ex) {
                    log.warn("analysis序列化失败: {}", ex.getMessage());
                }
            }

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

            // 可行性评分
            if (map.containsKey("feasibilityScore")) {
                try {
                    int score = ((Number) map.get("feasibilityScore")).intValue();
                    resp.setFeasibilityScore(Math.max(1, Math.min(5, score)));
                } catch (Exception e) {
                    resp.setFeasibilityScore(3);
                }
            } else {
                resp.setFeasibilityScore(3);
            }

            // 技术栈建议
            List<String> techList = (List<String>) map.get("techStack");
            if (techList != null && !techList.isEmpty()) {
                try {
                    resp.setTechStack(mapper.writeValueAsString(techList));
                } catch (Exception e) {
                    log.warn("techStack序列化失败: {}", e.getMessage());
                }
            }

            // 目标用户画像
            resp.setTargetUsers((String) map.getOrDefault("targetUsers", ""));

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
