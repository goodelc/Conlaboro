import type { Env } from '../types'
import { callAI } from '../lib/ai'
import type { AIMessage } from '../lib/ai/types'
import { json, error } from '../utils/response'
import { createSupabaseClient } from '../lib/supabase'

// 互联网/商业黑话词库
const JARGON_WORDS = '复盘、赋能、沉淀、倒逼、落地、串联、协同、反哺、兼容、包装、重组、履约、响应、量化、发力、布局、联动、细分、梳理、输出、加速、共建、支撑、融合、聚合、集成、对齐、对标、对焦、拆解、拉通、抽象、摸索、提炼、打通、打透、吃透、迁移、分发、分层、分装、穿梭、辐射、围绕、复用、渗透、扩展、开拓、漏斗、中台、闭环、打法、纽带、矩阵、刺激、规模、场景、聚焦、维度、格局、形态、生态、话术、体系、抓手、赛道、认知、玩法、体感、感知、调性、心智、战役、合力、心力、颗粒度、感知度、方法论、组合拳、引爆点、点线面、精细化、差异化、平台化、结构化、影响力、耦合性、易用性、一致性、端到端、短平快、生命周期、价值转化、强化认知、资源倾斜、完善逻辑、抽离透传、复用打法、商业模式、快速响应、定性定量、关键路径、去中心化、结果导向、垂直领域、归因分析、体验度量、信息屏障、壁垒、底层逻辑、范式、链路、迭代、解耦、阈值、洞察、驱动、牵引、击穿、穿透、引爆、裂变、护城河、业务吞吐量、交付质量、技术门槛、实现复杂度、资源投入、合理性、评估、方案、可优化空间、可行性、优先级'

// 政务/体制内黑话词库
const ZHENGWU_JARGON = '深入贯彻落实、全面深刻领会、提高政治站位、强化责任担当、统一思想认识、凝聚广泛共识、加强组织领导、完善体制机制、统筹协调推进、狠抓工作落实、聚焦突出问题、补齐短板弱项、夯实基层基础、筑牢思想防线、把握正确方向、明确目标任务、细化工作举措、创新方式方法、优化资源配置、提升能力素质、加强督促检查、严格考核问责、推动落地见效、取得阶段性成果、奠定坚实基础、提供坚强保障、营造良好氛围、凝聚奋进力量、谱写新篇章、夺取新胜利、开创新局面、迈上新台阶、实现新突破、展现新作为、作出新贡献、彰显新担当、呈现新气象、焕发新活力、激发新动能、培育新优势、打造新亮点、树立新标杆、构建新格局、推动高质量发展、统筹发展和安全、以人民为中心、不忘初心牢记使命、两个维护、四个意识、四个自信、国之大者、国之重器、顶层设计、系统谋划、整体推进、重点突破、分类施策、精准发力、久久为功、善作善成、蹄疾步稳、稳中求进、守正创新、攻坚克难、锐意进取、担当作为、真抓实干、务求实效、廉洁自律、风清气正、真抓实干、埋头苦干、兢兢业业、勤勤恳恳、任劳任怨、无私奉献、恪尽职守、履职尽责、主动作为、积极探索、大胆实践、先行先试、示范引领、典型带动、以点带面、全面推进、纵深推进、持续推进、深入推进、扎实推进、有序推进、协同推进、统筹推进、一体推进、融合推进、协调推进、同步推进、高位推进、强力推进、加快推进、全力推进、奋力推进、深入开展、广泛开展、持续开展、扎实开展、全面开展、认真开展、积极开展、大力开展、广泛深入、深入细致、全面细致、认真细致、扎实细致、精益求精、追求卓越、争创一流、勇攀高峰、只争朝夕、不负韶华、砥砺前行、接续奋斗、不懈奋斗、努力奋斗、团结奋斗、共同奋斗、持续奋斗'

const STYLE_GUIDES: Record<string, string> = {
  '正式': `【正式风格】
特点：专业严谨、不卑不亢、完整有层次、可直接复制发送、大量使用互联网/商业黑话
适用场景：向上汇报、正式邮件、跨部门沟通、项目汇报、方案讲解
结构要求：先陈述问题/情况 → 再说明原因/理由 → 然后提出建议/方案 → 最后用商量语气询问
黑话要求：必须大量使用黑话词库中的词汇（至少 5 个）
示例：
- "这个功能不太好做" → "该功能目前的实现复杂度较高，存在一定技术门槛，为了确保资源投入的合理性与交付质量，我们是否可以优先评估下当前方案的可优化空间，您看是否合适？"
- "我真的顶不住了" → "目前工作负荷远超阈值，带宽已满负荷，建议对任务优先级重新对齐，聚焦核心赛道，确保关键链路交付质量，您看是否可以？"
- "这个做不了" → "该需求的实现面临一定技术或资源壁垒，需进一步评估可行性，完善底层逻辑，优化实施方案，以保障最终交付质量，您觉得呢？"
- "我没时间" → "当前带宽主要聚焦在核心项目上，资源倾斜已达阈值，建议重新对齐优先级，聚焦核心场景，拉通关键链路，您看是否可行？"
- "这个功能很简单" → "从底层逻辑来看，这个功能颗粒度较小，方法论清晰，可快速落地复用，不会占用过多带宽，您看是否可以安排？"
- "我们要抓紧做" → "需聚焦核心目标，快速迭代，打通关键链路，形成闭环，引爆增长点，建议优先安排资源，您看是否合适？"`,

  '委婉': `【委婉风格】
特点：商量语气、留有余地、不得罪人、给对方面子、适度使用黑话
适用场景：拒绝请求、提出不同意见、指出问题、跨部门沟通
结构要求：先肯定/理解 → 再陈述困难 → 然后提出建议/替代方案 → 最后商量询问
黑话要求：适度使用（2-3 个）
示例：
- "这个功能不太好做" → "理解您的需求，不过这个功能目前实现复杂度确实有点高，为了确保交付质量，我们是否可以先评估一下方案，看看有没有可优化空间，您觉得呢？"
- "我真的顶不住了" → "最近带宽确实有点紧张，工作负荷有点超阈值了，我们看看能不能重新对齐一下优先级，聚焦核心事项，您看是否可以？"
- "这个做不了" → "这个需求实现起来可能存在一定壁垒，要不我们先评估一下可行性，看看有没有更优的解法，您觉得呢？"
- "你做得不对" → "这个方向或许可以再对齐一下，看看有没有更优的解法，我们一起复盘看看，您觉得呢？"
- "我不想做" → "我当前带宽主要在其他项目上，这个需求要不我们看看怎么协同处理，或者调整一下优先级，您看是否可行？"
- "这个方案不行" → "这个方案的底层逻辑可能需要再打磨一下，我们一起复盘看看有没有优化空间，您觉得呢？"`,

  '幽默': `【幽默风格】
特点：调侃自嘲、轻松有趣、会心一笑、缓解尴尬、黑话点缀
适用场景：熟悉的同事之间、非正式场合、轻松沟通、团队内部
结构要求：先幽默表达 → 再用黑话补充 → 最后可以有个小建议
黑话要求：点缀使用（1-2 个），重点在幽默
示例：
- "这个功能不太好做" → "这个功能看起来很有挑战性！感觉要击穿我的认知边界了，要不我们先评估一下，看看有没有更轻松的抓手？"
- "我真的顶不住了" → "感谢领导看得起！但我待办列表已经形成闭环，比春运火车站还挤，带宽严重不足，要不我们看看能不能先聚焦核心？"
- "这个做不了" → "这个需求看起来很有挑战性！但我的能力圈暂时还没覆盖到这个维度，要不我们换个抓手？"
- "我没时间" → "我的日程表已经形成闭环了，每一分钟都有安排，实在挤不出带宽，要不我们调整一下优先级？"
- "又要加班" → "看来今晚又要为公司的生态建设贡献一份力量了，赋能团队成长，大家一起加油！"
- "这个需求很奇怪" → "这个需求的底层逻辑有点超脱我的心智模型了，容我复盘一下，看看能不能找到抓手。"`,

  '政务': `【政务风格】
特点：公文措辞、四字短语、对仗工整、高度概括、大量使用体制内黑话
适用场景：正式报告、工作总结、官方文件、会议讲话、请示汇报
结构要求：先陈述情况 → 再说明意义/重要性 → 然后提出举措 → 最后强调落实
黑话要求：必须大量使用政务黑话词库中的词汇（至少 4-5 个）
示例：
- "这个功能不太好做" → "经评估论证，该事项面临多重制约因素，存在一定技术门槛，需进一步完善顶层设计，加强系统谋划，积极稳妥推进，您看是否合适？"
- "我真的顶不住了" → "经综合研判，当前资源配置与任务需求存在结构性矛盾，需加强统筹协调，完善体制机制，优化工作举措，确保各项工作有序推进。"
- "这个做不了" → "经评估论证，该事项面临多重制约因素，需进一步完善顶层设计，加强系统谋划，积极稳妥推进，我们是否可以再研究一下？"
- "我们要努力" → "提高政治站位，强化责任担当，统一思想认识，凝聚广泛共识，攻坚克难，狠抓落实，确保各项工作取得实效。"
- "进展不错" → "各项工作有序推进，取得阶段性成果，为后续工作奠定坚实基础，提供坚强保障，值得肯定。"
- "要重视这个问题" → "聚焦突出问题，补齐短板弱项，夯实基层基础，筑牢思想防线，强化责任落实，切实把各项工作抓紧抓好。"
- "这个想法很好" → "这个思路站位高、方向明、举措实，具有很强的指导性和可操作性，值得充分肯定，我们要认真抓好落实。"
- "要加快推进" → "加强组织领导，细化工作举措，创新方式方法，强化督促检查，推动落地见效，确保如期完成目标任务。"`
}

const PROMPTS = {
  translate: (style: string) => {
    const guide = STYLE_GUIDES[style] || STYLE_GUIDES['正式']
    const isZhengwu = style === '政务'
    const currentJargon = isZhengwu ? ZHENGWU_JARGON : JARGON_WORDS
    const jargonName = isZhengwu ? '政务黑话词库' : '互联网/商业黑话词库'

    return `你是一个专业的职场话术转换器。用户输入一句大白话，你把它翻译成${style}风格的职场黑话版本。

${guide}

【${jargonName}】（必须从中选用词汇）：${currentJargon}

【严格要求】
1. 必须使用上述${jargonName}中的词汇！正式风格至少用 5 个，政务风格至少用 4-5 个，委婉风格 2-3 个，幽默风格 1-2 个
2. 只输出一条翻译结果，不要输出多个版本或备选
3. 一段完整的话，有逻辑、有层次、可直接复制发送，60-200 字
4. 结构要完整：正式/委婉风格遵循"先陈述问题 → 再说明原因 → 然后提出建议 → 最后商量询问"的结构
5. 纯文本输出，严禁 markdown 符号（**、#、*、> 等）
6. 直接输出翻译结果，不要任何前缀说明或标题
7. 语义要与原文一致，只是表达方式更职场化、符合所选风格
8. 不要输出输入原文，只输出翻译后的结果`
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
1. 一段完整的话，有逻辑、有层次
2. 纯文本，严禁 markdown 符号
3. 直接输出结果`
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
