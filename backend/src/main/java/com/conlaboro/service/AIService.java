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
        你是一个资深的创业顾问和技术架构师，拥有丰富的项目孵化经验。用户会给你一个想法描述，你需要像专业投资人一样深入分析这个想法，并返回详尽的结构化结果。

        请严格按照以下JSON格式返回，不要包含任何其他文字：
        {
          "analysis": {
            "summary": "用3-5句话深入概括项目核心，说明：它要做什么、解决什么痛点、为谁创造价值、核心机制是什么",
            "highlights": ["亮点1：具体描述创新点或差异化优势，解释为什么重要", "亮点2：...", "亮点3：...", "亮点4：..."],
            "suggestions": ["建议1：具体的优化方向和实施方法", "建议2：...", "建议3：...", "建议4：..."],
            "risks": ["风险1：具体挑战+可能的应对思路", "风险2：...", "风险3：..."]
          },
          "feasibilityScore": 4,
          "techStack": ["技术1", "技术2", "技术3", "技术4", "技术5"],
          "targetUsers": "详细描述目标用户画像：他们是谁、年龄层、职业、使用场景、核心需求、当前痛点、使用频率预期",
          "coreFeatures": ["功能1：简述功能描述和用户价值", "功能2：...", "功能3：...", "功能4：...", "功能5：..."],
          "competitiveAdvantage": ["优势1：具体说明相对竞品的差异化优势", "优势2：...", "优势3：..."],
          "monetization": ["收入模式1：具体说明如何变现", "收入模式2：...", "收入模式3：..."],
          "riskMitigation": ["应对策略1：针对哪个风险、如何化解", "应对策略2：...", "应对策略3：..."],
          "userScenario": "描述一个典型用户使用该产品的完整场景故事，从发现需求到使用产品到获得价值的完整流程，2-3句话",
          "name": "项目名称（简洁有吸引力，不超过10个字）",
          "tagline": "一句话介绍这个项目（不超过30个字）",
          "category": "app/web/game/ai/tool 之一",
          "duration": "short/normal/long",
          "roles": [
            { "emoji": "emoji", "name": "角色名", "needed": 1, "description": "具体职责和需要做的事情" }
          ],
          "milestones": [
            { "title": "阶段名称", "description": "这个阶段要做什么，重点是什么", "deliverable": "阶段交付物" }
          ]
        }

        分析要求（请像专业顾问一样认真思考每个维度）：

        【项目理解 summary】
        - 不要泛泛而谈，要精准概括项目本质
        - 说明解决的痛点、创造的价值、核心机制
        - 让读者一眼理解"这是一个什么样的项目"

        【亮点与机会 highlights】4-5个
        - 深挖项目的独特价值、市场机会、技术创新点
        - 每个亮点要具体、有说服力，不能空泛
        - 考虑市场时机、技术趋势、用户需求缺口

        【完善建议 suggestions】4-5个
        - 给出具体的、可执行的建议
        - 包括功能补充、用户细分、技术选型、运营策略等
        - 每条建议要说明"为什么"和"怎么做"

        【潜在风险 risks】3-4个
        - 提示实际可能遇到的困难
        - 覆盖技术难度、市场竞争、用户获取、资源需求等方面
        - 每个风险附带简要应对思路

        【可行性评分 feasibilityScore】1-5整数
        - 1=极难实现 2=困难较多 3=需要努力 4=较可行 5=非常可行
        - 综合考虑：技术复杂度、市场时机、资源需求、竞争态势、团队能力要求

        【技术栈 techStack】5-6个
        - 推荐最相关的技术/框架/工具
        - 要具体（如"React"而非"前端框架"，"PostgreSQL"而非"数据库"）
        - 按重要程度排序

        【目标用户 targetUsers】
        - 描述用户画像：人群特征、年龄、职业、使用场景
        - 说明核心需求和当前痛点
        - 预估使用频率和粘性

        【核心功能 coreFeatures】5-6个
        - 列出MVP阶段最关键的功能
        - 每个功能说明其用户价值
        - 按优先级排序

        【竞争优势 competitiveAdvantage】3个
        - 相对现有竞品/替代方案的差异化
        - 护城河在哪里
        - 为什么用户会选择这个而非其他

        【商业模式 monetization】3个
        - 具体的收入模式
        - 考虑免费+增值、订阅、交易抽成等
        - 说明目标ARPU或定价思路

        【风险应对 riskMitigation】3个
        - 针对上面risks中每个风险的具体化解策略
        - 要可操作，不只是"注意风险"

        【使用场景 userScenario】
        - 讲一个用户从发现问题到使用产品到获得价值的故事
        - 让人能想象产品被使用的画面

        【角色 roles】3-5个
        - 每个角色说明具体职责
        - emoji要与角色匹配

        【里程碑 milestones】3个阶段
        - 每个阶段要有名称、详细描述、交付物
        - 从MVP到完整产品的渐进路径

        用专业但通俗的中文，避免空话套话，确保每条内容都有实质信息。""";

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
            "{\"summary\":\"%s\",\"highlights\":[\"想法具有明确的用户价值导向，解决了真实存在的痛点\",\"社区协作模式能降低创业门槛，让想法快速落地\",\"作为团队协作的起点，可以有效整合各方资源\"],\"suggestions\":[\"进一步明确目标用户群体，找到最核心的使用场景\",\"梳理核心功能优先级，先做最小可行产品(MVP)\",\"考虑技术实现的可行性，选择成熟的技术栈\",\"设计用户增长策略，考虑冷启动问题\"],\"risks\":[\"需要验证市场需求，建议先做用户调研\",\"资源协调可能存在挑战，需要合理分配人力\",\"同类竞品可能已经存在，需要找到差异化定位\"]}",
            summary
        );

        var roles = List.of(
                createRoleItem("\ud83c\udfaf", "\u4ea7\u54c1\u7ecf\u7406", 1, "\u5e2e\u5fd9\u6e05\u695a\u8981\u505a\u4ec0\u4e48"),
                createRoleItem("\ud83c\udfa8", "\u8bbe\u8ba1\u5e08", 1, "\u8bbe\u8ba1\u597d\u7528\u7684\u754c\u9762"),
                createRoleItem("\ud83d\udcbb", "\u524d\u7aef\u5f00\u53d1", 1, "\u505a\u51faApp\u754c\u9762"),
                createRoleItem("\u2699\ufe0f", "\u540e\u7aef\u5f00\u53d1", 1, "\u5904\u7406\u6570\u636e\u548c\u903b\u8f91")
        );

        var milestones = List.of(
                createMilestoneItem("\u8c03\u7814\u9700\u6c42\uff0c\u8bbe\u8ba1\u539f\u578b", "\u6df1\u5165\u4e86\u89e3\u76ee\u6807\u7528\u6237\u9700\u6c42\uff0c\u5b8c\u6210\u4ea7\u54c1\u539f\u578b\u8bbe\u8ba1", "\u7528\u6237\u8c03\u7814\u62a5\u544a\u3001\u4ea7\u54c1\u539f\u578b\u56fe"),
                createMilestoneItem("\u5f00\u53d1\u6838\u5fc3\u529f\u80fd", "\u5b9e\u73b0MVP\u6838\u5fc3\u529f\u80fd\uff0c\u5b8c\u6210\u57fa\u672c\u7528\u6237\u6d41\u7a0b", "\u53ef\u8fd0\u884c\u7684MVP\u4ea7\u54c1"),
                createMilestoneItem("\u6d4b\u8bd5\u4f18\u5316\uff0c\u4e0a\u7ebf", "\u7528\u6237\u6d4b\u8bd5\u3001\u4fee\u590d\u95ee\u9898\u3001\u4f18\u5316\u4f53\u9a8c\uff0c\u51c6\u5907\u4e0a\u7ebf", "\u6b63\u5f0f\u4e0a\u7ebf\u7248\u672c")
        );

        var result = new AiAnalyzeResponse();
        result.setAnalysis(analysisJson);
        result.setName(name);
        result.setTagline(tagline);
        result.setCategory(category);
        result.setDuration("normal");
        result.setFeasibilityScore(3);
        result.setTechStack("[\"React\",\"Node.js\",\"PostgreSQL\"]");
        result.setTargetUsers("对协作和创新感兴趣的开发者和创作者，年龄在20-35岁，日常使用互联网产品，希望将想法快速变为现实");
        result.setCoreFeatures("[\"用户注册和项目管理\",\"实时协作编辑\",\"任务分配和进度跟踪\",\"社区讨论和反馈\",\"数据统计和可视化\"]");
        result.setCompetitiveAdvantage("[\"社区协作模式降低创业门槛\",\"轻量级快速启动\",\"开放透明的工作方式\"]");
        result.setMonetization("[\"免费基础版+高级功能订阅\",\"项目增值服务收费\",\"企业版定制化收费\"]");
        result.setRiskMitigation("[\"通过用户调研验证需求，先做小范围测试\",\"合理分配资源，优先核心功能\",\"找到差异化定位，避开直接竞争\"]");
        result.setUserScenario("一个有创业想法的设计师，在平台上发布了自己的项目想法，AI自动生成了项目方案，他邀请了几位开发者加入团队，大家一起协作开发，最终成功上线了产品");
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

    private AiAnalyzeResponse.MilestoneItem createMilestoneItem(String title, String description, String deliverable) {
        var item = new AiAnalyzeResponse.MilestoneItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setDeliverable(deliverable);
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

            // 核心功能
            List<String> coreFeatures = (List<String>) map.get("coreFeatures");
            if (coreFeatures != null && !coreFeatures.isEmpty()) {
                try {
                    resp.setCoreFeatures(mapper.writeValueAsString(coreFeatures));
                } catch (Exception e) {
                    log.warn("coreFeatures序列化失败: {}", e.getMessage());
                }
            }

            // 竞争优势
            List<String> compAdv = (List<String>) map.get("competitiveAdvantage");
            if (compAdv != null && !compAdv.isEmpty()) {
                try {
                    resp.setCompetitiveAdvantage(mapper.writeValueAsString(compAdv));
                } catch (Exception e) {
                    log.warn("competitiveAdvantage序列化失败: {}", e.getMessage());
                }
            }

            // 商业模式
            List<String> monetization = (List<String>) map.get("monetization");
            if (monetization != null && !monetization.isEmpty()) {
                try {
                    resp.setMonetization(mapper.writeValueAsString(monetization));
                } catch (Exception e) {
                    log.warn("monetization序列化失败: {}", e.getMessage());
                }
            }

            // 风险应对
            List<String> riskMit = (List<String>) map.get("riskMitigation");
            if (riskMit != null && !riskMit.isEmpty()) {
                try {
                    resp.setRiskMitigation(mapper.writeValueAsString(riskMit));
                } catch (Exception e) {
                    log.warn("riskMitigation序列化失败: {}", e.getMessage());
                }
            }

            // 使用场景
            resp.setUserScenario((String) map.getOrDefault("userScenario", ""));

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
                    mi.setTitle((String) m.getOrDefault("title", "阶段目标"));
                    mi.setDescription((String) m.getOrDefault("description", ""));
                    mi.setDeliverable((String) m.getOrDefault("deliverable", ""));
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
