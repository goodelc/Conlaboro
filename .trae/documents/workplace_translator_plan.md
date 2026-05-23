# 职场话术转换器实现计划

## 一、需求分析

### 1.1 核心功能
- 用户输入大白话（如："这个做不了"）
- 系统根据选择的风格（正式/委婉/幽默/政务）翻译为职场黑话
- 参考效果：输入"这个做不了" → 输出"该需求的实现目前面临一定的技术或资源壁垒 我们需要进一步的评估可行性，以保障最终交付质量，你看是否合适"

### 1.2 当前代码问题
1. `BANNED_WORDS` 应该是黑话词库，而非禁用词
2. Prompt 不够具体，缺少详细示例和指令
3. 风格指南只有一个示例，AI 难以准确理解
4. 缺少明确要求使用黑话词汇的指令

## 二、实现方案

### 2.1 项目适配
由于当前项目是 Java Spring Boot 项目，我们将在现有后端基础上扩展功能：
- 创建新的 DTO 类：`WorkplaceTranslateRequest` 和 `WorkplaceTranslateResponse`
- 在 `AIService` 中添加新的翻译方法
- 在 `AiController` 中添加新的 API 端点

### 2.2 核心修改点

#### 1. 黑话词库重构
- 重命名为 `JARGON_WORDS`（行话词汇）
- 将词汇拆分为分类，便于 AI 理解使用场景

#### 2. Prompt 优化
- 每个风格都提供多个示例
- 明确要求必须使用黑话词库中的词汇
- 详细说明每种风格的特点和适用场景
- 提供输入输出对示例

#### 3. 风格系统完善
- 正式风格：专业、严谨、使用大量黑话
- 委婉风格：留有余地、商量语气
- 幽默风格：自嘲、调侃、轻松
- 政务风格：公文体、四字短语、对仗工整

## 三、文件修改计划

### 新增文件
1. `backend/src/main/java/com/conlaboro/dto/WorkplaceTranslateRequest.java` - 翻译请求 DTO
2. `backend/src/main/java/com/conlaboro/dto/WorkplaceTranslateResponse.java` - 翻译响应 DTO

### 修改文件
1. `backend/src/main/java/com/conlaboro/service/AIService.java` - 添加翻译方法
2. `backend/src/main/java/com/conlaboro/controller/AiController.java` - 添加新 API 端点

## 四、详细实现步骤

### 步骤 1：创建 DTO 类
- `WorkplaceTranslateRequest`：包含 text（输入文本）、style（风格）
- `WorkplaceTranslateResponse`：包含 result（翻译结果）、model、usage 等信息

### 步骤 2：重构 AIService
- 添加 `translateWorkplaceText` 方法
- 定义风格常量和黑话词库
- 为每个风格编写详细的 system prompt
- 调用 DeepSeek API 进行翻译

### 步骤 3：添加 API 端点
- 在 AiController 中添加 `/api/ai/translate-workplace` 端点
- 接收翻译请求并返回结果

### 步骤 4：优化 Prompt（核心）
为每个风格编写详细的 prompt，包含：
- 风格特点说明
- 黑话词库
- 多个输入输出示例
- 明确的输出要求

## 五、Prompt 设计要点

### 正式风格 Prompt 示例
```
你是一个专业的职场话术转换器。用户输入一句大白话，你需要把它翻译成【正式商务风格】的职场黑话版本。

【风格特点】
- 专业、严谨、不卑不亢
- 大量使用职场黑话词汇
- 显得有深度、有水平、经过深思熟虑

【黑话词库】（必须从中选用至少3-5个词汇）
壁垒、赋能、颗粒度、对齐、带宽、业务吞吐量、交付质量、沉淀、抓手、闭环、心智、底层逻辑、范式、矩阵、链路、复用、迭代、耦合、解耦、维度、阈值、复盘、聚焦、协同、打通、拉通、落地、承接、支撑、响应、感知、洞察、驱动、牵引、倒逼、击穿、穿透、引爆、裂变、生态、护城河

【输入输出示例】
输入："这个做不了"
输出："该需求的实现目前面临一定的技术或资源壁垒，我们需要进一步评估可行性，以保障最终交付质量，你看是否合适？"

输入："我没时间做"
输出："当前带宽有限，建议重新对齐优先级，确保核心业务吞吐量"

【要求】
1. 必须使用上述黑话词库中的词汇（至少3-5个）
2. 一句话，简洁有力
3. 纯文本，不要 markdown
4. 直接输出结果，不要前缀
```

## 六、风险与注意事项

1. **API 兼容**：确保新增 API 与现有代码风格一致
2. **错误处理**：保持与现有 AIService 相同的错误处理和降级方案
3. **Prompt 调优**：可能需要多次测试调整 prompt 才能达到理想效果
4. **Token 控制**：注意 prompt 长度，避免超过 API 限制
