import type { Env } from '../types'
import { callAI } from '../lib/ai'
import type { AIMessage } from '../lib/ai/types'
import { json, error } from '../utils/response'
import { createSupabaseClient } from '../lib/supabase'

// 黑话词库 - 这些是要使用的，不是禁用的！
const JARGON_WORDS = '赋能、颗粒度、对齐、带宽、业务吞吐量、交付质量、沉淀、抓手、闭环、心智、底层逻辑、范式、矩阵、链路、复用、迭代、耦合、解耦、维度、阈值、复盘、聚焦、协同、打通、拉通、落地、承接、支撑、响应、感知、洞察、驱动、牵引、倒逼、击穿、穿透、引爆、裂变、生态、护城河、壁垒'

const STYLE_GUIDES: Record<string, string> = {
  '正式': `【正式风格】
特点：专业严谨、不卑不亢、显得经过深思熟虑、有深度
适用场景：向上汇报、正式邮件、跨部门沟通
黑话要求：必须大量使用黑话词库中的词汇（至少 5 个）
示例：
- "我真的顶不住了" → "目前工作负荷较大，建议对任务优先级进行重新梳理对齐，确保核心业务交付质量"
- "这个做不了" → "该需求的实现目前面临一定的技术或资源壁垒，我们需要进一步评估可行性，以保障最终交付质量，你看是否合适？"
- "我没时间" → "当前带宽有限，建议重新对齐优先级，聚焦核心链路"
- "这个功能很简单" → "从底层逻辑来看，这个功能的颗粒度较小，可快速落地"
- "我们要抓紧做" → "需要聚焦核心目标，快速迭代，打通关键链路"`,

  '委婉': `【委婉风格】
特点：商量语气、留有余地、不得罪人、给对方面子
适用场景：拒绝请求、提出不同意见、指出问题
黑话要求：适度使用（2-3 个）
示例：
- "我真的顶不住了" → "工作负荷有点超了，我们看看能不能重新对齐一下优先级？"
- "这个做不了" → "这个需求实现起来可能存在一定壁垒，要不我们先评估一下可行性？"
- "你做得不对" → "这个方向或许可以再对齐一下，看看有没有更优的解法"
- "我不想做" → "我当前带宽主要在其他项目上，这个需求要不我们看看怎么协同处理？"
- "这个方案不行" → "这个方案的底层逻辑可能需要再打磨一下，我们一起复盘看看？"`,

  '幽默': `【幽默风格】
特点：调侃自嘲、轻松有趣、会心一笑、缓解尴尬
适用场景：熟悉的同事之间、非正式场合、轻松沟通
黑话要求：点缀使用（1-2 个），重点在幽默
示例：
- "我真的顶不住了" → "感谢领导看得起！但我待办列表已经比春运火车站还挤了，带宽严重不足"
- "这个做不了" → "这个需求看起来很有挑战性！但我的能力圈暂时还没覆盖到这个维度，要不我们换个抓手？"
- "我没时间" → "我的日程表已经形成闭环了，每一分钟都有安排，实在挤不出带宽"
- "又要加班" → "看来今晚又要为公司的生态建设贡献一份力量了"
- "这个需求很奇怪" → "这个需求的底层逻辑有点超脱我的心智模型了，容我复盘一下"`,

  '政务': `【政务风格】
特点：公文措辞、四字短语、对仗工整、高度概括
适用场景：正式报告、工作总结、官方文件
黑话要求：使用特定词汇（3-4 个），重点在句式
示例：
- "我真的顶不住了" → "经综合研判，资源配置与任务需求存在结构性矛盾，需优化统筹协调机制"
- "这个做不了" → "经评估论证，该事项面临多重制约因素，需进一步完善顶层设计"
- "我们要努力" → "统一思想、凝聚共识、攻坚克难、狠抓落实"
- "进展不错" → "各项工作有序推进，取得阶段性成效，为后续工作奠定坚实基础"
- "要重视这个问题" → "提高政治站位，强化责任担当，聚焦突出问题，补齐工作短板"`
}

const PROMPTS = {
  translate: (style: string) => {
    const guide = STYLE_GUIDES[style] || STYLE_GUIDES['正式']
    const jargonRequirement = style === '正式' ? '至少 5 个' : style === '政务' ? '3-4 个' : style === '委婉' ? '2-3 个' : '1-2 个'

    return `你是一个专业的职场话术转换器。用户输入一句大白话，你把它翻译成${style}风格的职场黑话版本。

${guide}

【黑话词库】（必须从中选用词汇）：${JARGON_WORDS}

【严格要求】
1. 必须使用上述黑话词库中的词汇！正式风格至少用 5 个，政务风格 3-4 个，委婉风格 2-3 个，幽默风格 1-2 个
2. 只输出一条翻译结果，不要输出多个版本或备选
3. 一句话，简洁有力，30-100 字
4. 纯文本输出，严禁 markdown 符号（**、#、*、> 等）
5. 直接输出翻译结果，不要任何前缀说明或标题
6. 语义要与原文一致，只是表达方式更职场化、符合所选风格
7. 不要输出输入原文，只输出翻译后的结果`
  },

  boss: `你是一个在职场混了10年的老油条。同事发来老板说的一句黑话，你要帮TA翻译成人话。

【第一步】用大白话说清楚老板这句话的真实意思（一句话）
【第二步】分析老板的潜台词/真实意图（一句话）
【第三步】给3条回复建议，每条都是能直接复制发给老板的话

【风格对标——要达到这种效果】
老板说："这个项目我们要对齐一下颗粒度"
→ 人话版：老板觉得你现在说的太笼统太虚了，他想抠细节验证你是不是真懂行
→ 回复示例1："好的老板，那我马上把项目拆成具体的执行步骤，每个节点谁负责什么时候做完都列出来，咱们对着过一遍？"
→ 回复示例2："没问题确实需要细化，那我针对风险点和关键路径做个详细方案，下午找时间跟您同步一下？"

【JSON格式】严格按以下格式输出，不要其他内容：
{"translation":"人话版","intent":"潜台词","replies":["回复1","回复2","回复3"]}`,

  workplace: `你是一个职场话术转换器。根据用户选择的风格方向，把输入的内容重新表达。

【核心原则：根据用户选择的风格方向，把输入的内容重新表达。】

【必须遵守】
1. 一句话，简洁有力
4. 纯文本，严禁 markdown 符号
5. 直接输出结果`
}

interface TranslateRequestBody {
  text: string
  mode?: 'translate' | 'boss' | 'workplace'
  style?: string
  direction?: string
  provider?: string
}

interface JwtPayload {
  sub: string
  iat: number
  exp: number
}

function extractOpenIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')

  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1])) as JwtPayload
    return payload.sub
  } catch {
    return null
  }
}

async function getUserIdByOpenId(env: Env, openId: string): Promise<string | null> {
  const supabase = createSupabaseClient(env)
  const user = await supabase.findByColumn<any>('users', 'open_id', openId)
  return user?.id || null
}

export async function handleTranslate(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as TranslateRequestBody

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return error('请输入需要翻译的内容')
    }

    if (body.text.length > 500) {
      return error('输入内容过长，请控制在500字以内')
    }

    const mode = body.mode || 'translate'
    const style = body.style || '正式'
    let systemPrompt: string

    switch (mode) {
      case 'boss':
        systemPrompt = PROMPTS.boss
        break
      case 'workplace':
        systemPrompt = PROMPTS.workplace
        break
      default:
        systemPrompt = PROMPTS.translate(style)
    }

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: body.text.trim() },
    ]

    const result = await callAI(env, messages, {
      scenario: mode,
      provider: body.provider as any,
      temperature: mode === 'boss' ? 0.8 : 0.7,
      maxTokens: 2000,
    })

    const openId = extractOpenIdFromRequest(request)
    if (openId) {
      try {
        const userId = await getUserIdByOpenId(env, openId)
        if (userId) {
          const supabase = createSupabaseClient(env)
          await supabase.insert('history', {
            user_id: userId,
            input_text: body.text.trim(),
            output_text: result.content,
            type: mode,
            ai_provider: result.provider,
            ai_model: result.model,
          })
          console.log('[Translate] History saved successfully')
        }
      } catch (err) {
        console.warn('[Translate] 保存历史失败（不影响主流程）:', err)
      }
    }

    return json({
      success: true,
      data: {
        result: result.content,
        model: result.model,
        provider: result.provider,
        usage: result.usage,
      },
    })
  } catch (err) {
    console.error('Translate error:', err)
    const message = err instanceof Error ? err.message : '翻译服务暂时不可用'
    return error(message, 502)
  }
}
