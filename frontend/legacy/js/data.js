// ==================== BADGE DATA ====================
const badges = [
  // 入门系列
  { id: 0, icon: '🌟', name: '初心者', series: '入门系列', desc: '你来了，你准备好了。每一段伟大的旅程都始于第一步。', condition: '完成个人资料', earned: true, date: '2025年3月15日' },
  { id: 1, icon: '🔥', name: '第一把火', series: '入门系列', desc: '跨出了第一步，加入了你的第一个项目。星星之火，可以燎原。', condition: '加入第一个项目', earned: true, date: '2025年4月10日' },
  { id: 2, icon: '✍️', name: '第一笔', series: '入门系列', desc: '你提交了第一次贡献。从此以后，你不再是一个旁观者。', condition: '提交第一次贡献', earned: true, date: '2025年4月12日' },
  { id: 3, icon: '🤝', name: '握手', series: '入门系列', desc: '第一次被项目接受。你的能力得到了认可。', condition: '第一次被项目接受', earned: true, date: '2025年4月10日' },
  // 实践系列
  { id: 4, icon: '🎯', name: '产品之手', series: '实践系列', desc: '作为产品经理完成了3个项目。你擅长定义产品、洞察需求。', condition: '作为PM完成3个项目', earned: false },
  { id: 5, icon: '🎨', name: '设计之眼', series: '实践系列', desc: '作为设计师完成了3个项目。你擅长创造美好的体验。', condition: '作为设计师完成3个项目', earned: false },
  { id: 6, icon: '💻', name: '代码之力', series: '实践系列', desc: '作为开发者完成了3个项目。你擅长将想法变为现实。', condition: '作为开发者完成3个项目', earned: false },
  { id: 7, icon: '🔍', name: '质量之盾', series: '实践系列', desc: '作为测试完成了3个项目。你是产品质量的守护者。', condition: '作为测试完成3个项目', earned: false },
  // 协作系列
  { id: 8, icon: '🧭', name: '领航者', series: '协作系列', desc: '发起并成功上线一个项目。你证明了自己能把想法变成现实。', condition: '发起并成功上线一个项目', earned: false },
  { id: 9, icon: '🌉', name: '桥梁', series: '协作系列', desc: '参与了5个不同类型的项目。你是真正的多面手。', condition: '参与5个不同类型的项目', earned: false },
  { id: 10, icon: '📚', name: '导师', series: '协作系列', desc: '帮助10个人Review过方案。你在用自己的经验帮助他人成长。', condition: '帮10个人Review过方案', earned: false },
  { id: 11, icon: '🔥', name: '不灭', series: '协作系列', desc: '连续30天有贡献记录。坚持是最稀缺的品质。', condition: '连续30天有贡献记录', earned: false },
  // 传奇系列
  { id: 12, icon: '⭐', name: '公社之星', series: '传奇系列', desc: '累计贡献值排名前1%。你是公社的传奇，你的名字将被铭记。', condition: '累计积分Top 1%', earned: false },
  { id: 13, icon: '🌈', name: '全栈创客', series: '传奇系列', desc: '集齐产品经理+设计师+开发者徽章。你什么都能做，你是全能的。', condition: '集齐PM+设计+开发徽章', earned: false },
  { id: 14, icon: '🚀', name: '造物主', series: '传奇系列', desc: '发起3个项目并成功上线。你是真正的创造者，世界因你而不同。', condition: '发起3个项目并成功上线', earned: false },
  { id: 15, icon: '🏆', name: '初出茅庐', series: '入门系列', desc: '完成了第一个里程碑贡献。万里长征第一步，但你已经迈出去了。', condition: '完成第一个里程碑任务', earned: true, date: '2025年4月20日' },
];

// ==================== DATA ====================
const projects = [
  {
    id: 0,
    title: '面向独居青年的社交做饭 App',
    desc: '一个人做饭太麻烦，点外卖又不健康。做一个让独居的人可以"拼饭"的 App——匹配附近的做饭搭子，一起做饭、一起吃饭、交到朋友。解决独居青年的社交困境和吃饭问题。',
    status: 'open',
    category: 'app',
    author: 'Lina',
    authorColor: '#D4213D',
    createdAt: '2025-04-10',
    duration: '2 个月',
    license: 'MIT 开源协议',
    roles: [
      { name: '产品经理', emoji: '🎯', needed: 1, filled: 1, members: [{name:'Lina', color:'#D4213D'}] },
      { name: '设计师', emoji: '🎨', needed: 1, filled: 0, members: [] },
      { name: '前端开发', emoji: '💻', needed: 2, filled: 0, members: [] },
      { name: '后端开发', emoji: '⚙️', needed: 1, filled: 1, members: [{name:'Kevin', color:'#4A90D9'}] },
    ],
    milestones: [
      { title: '需求调研与原型设计', status: 'done', date: '4月10日 - 4月20日', tasks: [
        { name: '用户调研报告', status: 'done', assignee: 'Lina', xp: 15 },
        { name: '竞品分析', status: 'done', assignee: 'Lina', xp: 15 },
        { name: '低保真原型', status: 'done', assignee: null, xp: 20 },
        { name: 'PRD文档', status: 'done', assignee: 'Lina', xp: 15 },
      ]},
      { title: 'UI 设计与前端开发', status: 'current', date: '4月21日 - 5月15日', tasks: [
        { name: '高保真设计稿', status: 'progress', assignee: null, xp: 25 },
        { name: '首页开发', status: 'open', assignee: null, xp: 20 },
        { name: '匹配功能开发', status: 'open', assignee: null, xp: 25 },
        { name: '聊天功能开发', status: 'open', assignee: null, xp: 20 },
      ]},
      { title: '后端开发与联调', status: 'pending', date: '5月16日 - 6月5日', tasks: [
        { name: 'API开发', status: 'open', assignee: null, xp: 25 },
        { name: '数据库设计', status: 'open', assignee: null, xp: 20 },
        { name: '前后端联调', status: 'open', assignee: null, xp: 15 },
      ]},
      { title: '测试与上线', status: 'pending', date: '6月6日 - 6月15日', tasks: [
        { name: '功能测试', status: 'open', assignee: null, xp: 15 },
        { name: 'Bug修复', status: 'open', assignee: null, xp: 15 },
        { name: '性能优化', status: 'open', assignee: null, xp: 15 },
        { name: '正式上线', status: 'open', assignee: null, xp: 30 },
      ]},
    ],
    comments: [
      { user: 'Lina', color: '#D4213D', text: 'M1 的所有任务已完成！大家辛苦了，接下来进入设计+开发阶段 🎉', time: '2天前' },
      { user: 'Kevin', color: '#4A90D9', text: '数据库 schema 我已经设计好了，等 M2 开始就可以直接用。', time: '1天前' },
      { user: 'Lina', color: '#D4213D', text: '@Kevin 太好了！设计稿出来后我们就可以同步开发了', time: '18小时前' },
    ],
    files: [
      { name: '用户调研报告.pdf', icon: '📄', uploader: 'Lina', time: '4月18日' },
      { name: '竞品分析报告.pdf', icon: '📊', uploader: 'Lina', time: '4月16日' },
      { name: 'PRD v1.2.docx', icon: '📝', uploader: 'Lina', time: '4月20日' },
      { name: '低保真原型.fig', icon: '🎨', uploader: 'Lina', time: '4月19日' },
      { name: '数据库设计.md', icon: '🗃️', uploader: 'Kevin', time: '4月21日' },
    ],
  },
  {
    id: 1,
    title: 'AI 驱动的个人知识图谱工具',
    desc: '用 AI 自动整理你的笔记、书签、截图，生成可视化的知识图谱。让碎片化的信息变成系统化的知识。支持多种数据源导入，智能关联，帮助用户发现知识之间的隐藏联系。',
    status: 'progress',
    category: 'ai',
    author: 'Wang',
    authorColor: '#F59E0B',
    createdAt: '2025-03-28',
    duration: '3 个月',
    license: 'Apache 2.0',
    roles: [
      { name: '产品经理', emoji: '🎯', needed: 1, filled: 1, members: [{name:'Wang', color:'#F59E0B'}] },
      { name: '设计师', emoji: '🎨', needed: 1, filled: 1, members: [{name:'Mia', color:'#10B981'}] },
      { name: '前端开发', emoji: '💻', needed: 2, filled: 1, members: [{name:'Zhang', color:'#6366F1'}] },
      { name: 'AI 工程师', emoji: '🤖', needed: 1, filled: 0, members: [] },
    ],
    milestones: [
      { title: '产品定义与技术选型', status: 'done', date: '3月28日 - 4月10日', tasks: ['需求文档','技术方案','AI模型选型'] },
      { title: '核心功能 MVP', status: 'current', date: '4月11日 - 5月10日', tasks: ['知识图谱可视化','AI自动分类','数据导入功能'] },
      { title: '高级功能开发', status: 'pending', date: '5月11日 - 6月10日', tasks: ['智能关联','搜索功能','分享功能'] },
    ]
  },
  {
    id: 2,
    title: '二手物品交换平台（校园版）',
    desc: '不卖二手，只交换。你不需要的东西，可能正是别人想要的。以物易物，让闲置物品流动起来。专注校园场景，基于地理位置匹配，打造信任感强的交换社区。',
    status: 'open',
    category: 'web',
    author: 'Sisi',
    authorColor: '#EC4899',
    createdAt: '2025-04-18',
    duration: '1 个月',
    license: 'MIT',
    roles: [
      { name: '产品经理', emoji: '🎯', needed: 1, filled: 0, members: [] },
      { name: '设计师', emoji: '🎨', needed: 1, filled: 0, members: [] },
      { name: '全栈开发', emoji: '💻', needed: 2, filled: 0, members: [] },
      { name: '测试', emoji: '🧪', needed: 1, filled: 0, members: [] },
    ],
    milestones: [
      { title: '需求与设计', status: 'current', date: '4月18日 - 4月28日', tasks: ['用户调研','产品设计','数据库设计'] },
      { title: '核心开发', status: 'pending', date: '4月29日 - 5月15日', tasks: ['发布物品','匹配算法','聊天功能'] },
      { title: '测试上线', status: 'pending', date: '5月16日 - 5月22日', tasks: ['测试','Bug修复','上线'] },
    ]
  },
  {
    id: 3,
    title: '程序员远程协作白板工具',
    desc: '专为远程团队设计的实时白板，支持代码片段、架构图、流程图。轻量、快速、免费。已成功上线，日活用户 500+。',
    status: 'done',
    category: 'tool',
    author: 'Jay',
    authorColor: '#14B8A6',
    createdAt: '2025-01-15',
    duration: '2 个月',
    license: 'MIT',
    roles: [
      { name: '产品经理', emoji: '🎯', needed: 1, filled: 1, members: [{name:'Jay', color:'#14B8A6'}] },
      { name: '设计师', emoji: '🎨', needed: 1, filled: 1, members: [{name:'Yuki', color:'#F97316'}] },
      { name: '前端开发', emoji: '💻', needed: 2, filled: 2, members: [{name:'Chen', color:'#8B5CF6'},{name:'Rui', color:'#EF4444'}] },
      { name: '后端开发', emoji: '⚙️', needed: 1, filled: 1, members: [{name:'Alex', color:'#0EA5E9'}] },
    ],
    contributors: [
      { name: 'Jay', color: '#14B8A6', role: '产品经理', xp: 245, hours: 68, commits: 12, details: 'PRD×3 · 评审×7 · 需求分析×2', pct: 82 },
      { name: 'Chen', color: '#8B5CF6', role: '前端开发', xp: 198, hours: 92, commits: 18, details: '代码×15 · Review×3', pct: 66 },
      { name: 'Yuki', color: '#F97316', role: '设计师', xp: 156, hours: 54, commits: 9, details: '设计稿×6 · 评审×3', pct: 52 },
      { name: 'Alex', color: '#0EA5E9', role: '后端开发', xp: 134, hours: 78, commits: 8, details: 'API×8 · 数据库×3', pct: 45 },
    ],
    totalHours: 292,
    totalCommits: 47,
    completedAt: '2025-03-15',
    deliverables: [
      { icon: '📄', name: 'PRD文档', desc: 'v3.2 最终版 · 32页', bg: 'rgba(212,33,61,0.1)' },
      { icon: '🎨', name: '设计稿', desc: 'Figma · 48个页面', bg: 'rgba(249,115,22,0.1)' },
      { icon: '💻', name: '源代码', desc: 'GitHub · MIT协议', bg: 'rgba(139,92,246,0.1)' },
      { icon: '📊', name: '测试报告', desc: '覆盖率 89%', bg: 'rgba(14,165,233,0.1)' },
      { icon: '🌐', name: '在线地址', desc: 'whiteboard.co · 日活500+', bg: 'rgba(34,139,34,0.1)' },
      { icon: '📹', name: '演示视频', desc: '3分钟产品Demo', bg: 'rgba(212,168,67,0.1)' },
    ],
    activities: [
      { user: 'Jay', color: '#14B8A6', text: '提交了最终版PRD文档', time: '3月14日' },
      { user: 'Chen', color: '#8B5CF6', text: '修复了3个性能问题', time: '3月13日' },
      { user: 'Alex', color: '#0EA5E9', text: '完成了API压力测试', time: '3月12日' },
      { user: 'Yuki', color: '#F97316', text: '更新了导出功能的UI设计', time: '3月10日' },
      { user: 'Chen', color: '#8B5CF6', text: '完成了流程图编辑器', time: '3月8日' },
      { user: 'Jay', color: '#14B8A6', text: '项目正式上线！🎉', time: '3月15日' },
    ],
    milestones: [
      { title: 'MVP 开发', status: 'done', date: '1月15日 - 2月10日', tasks: ['白板核心','实时协作','代码片段'] },
      { title: '功能完善', status: 'done', date: '2月11日 - 3月1日', tasks: ['架构图','流程图','导出功能'] },
      { title: '上线运营', status: 'done', date: '3月2日 - 3月15日', tasks: ['性能优化','正式上线','用户反馈'] },
    ]
  },
  {
    id: 4,
    title: '老年人友好的健康打卡小程序',
    desc: '大字体、语音输入、一键操作。让不会用智能手机的老人也能记录血压、吃药、运动。子女可以远程查看父母的健康数据，安心又方便。',
    status: 'open',
    category: 'app',
    author: 'Han',
    authorColor: '#0EA5E9',
    createdAt: '2025-04-20',
    duration: '1 个月',
    license: 'MIT',
    roles: [
      { name: '产品经理', emoji: '🎯', needed: 1, filled: 1, members: [{name:'Han', color:'#0EA5E9'}] },
      { name: '设计师', emoji: '🎨', needed: 1, filled: 0, members: [] },
      { name: '小程序开发', emoji: '📱', needed: 1, filled: 0, members: [] },
    ],
    milestones: [
      { title: '需求与原型', status: 'current', date: '4月20日 - 4月30日', tasks: ['老人用户调研','适老化设计规范','低保真原型'] },
      { title: '开发与测试', status: 'pending', date: '5月1日 - 5月18日', tasks: ['小程序开发','语音功能','子女端开发'] },
    ]
  },
  {
    id: 5,
    title: '独立游戏：像素风农场经营',
    desc: '像素风格的农场经营游戏，融合社交元素。种田、养殖、交易、交朋友。用 Godot 引擎开发，目标平台 PC + Switch。',
    status: 'progress',
    category: 'game',
    author: 'Qi',
    authorColor: '#A855F7',
    createdAt: '2025-03-01',
    duration: '3 个月+',
    license: 'CC BY-NC-SA 4.0',
    roles: [
      { name: '游戏策划', emoji: '🎮', needed: 1, filled: 1, members: [{name:'Qi', color:'#A855F7'}] },
      { name: '像素美术', emoji: '🎨', needed: 1, filled: 1, members: [{name:'Tao', color:'#22C55E'}] },
      { name: '游戏开发', emoji: '💻', needed: 2, filled: 1, members: [{name:'Ning', color:'#EAB308'}] },
      { name: '音效设计', emoji: '🔊', needed: 1, filled: 0, members: [] },
    ],
    milestones: [
      { title: '核心玩法设计', status: 'done', date: '3月1日 - 3月20日', tasks: ['游戏设计文档','核心机制原型','美术风格定义'] },
      { title: 'Alpha 版本', status: 'current', date: '3月21日 - 5月10日', tasks: ['农场系统','NPC系统','交易系统','社交系统'] },
      { title: 'Beta 与发布', status: 'pending', date: '5月11日 - 6月30日', tasks: ['音效','平衡性调整','测试','Steam发布'] },
    ]
  }
];

// ==================== USER DATA ====================
const users = {
  'Jay': { name: 'Jay', color: '#14B8A6', role: '产品经理', level: 5, levelName: '引领者', xp: 4230, projects: 4, badges: 9, joined: '2024年8月', bio: '连续创业者，擅长从0到1。相信好的产品能改变世界。在公社发起了3个项目，2个已成功上线。', skills: [{name:'需求分析',pct:92},{name:'PRD撰写',pct:88},{name:'竞品分析',pct:85},{name:'团队协作',pct:90},{name:'用户调研',pct:78},{name:'项目管理',pct:86}], earnedBadges: [0,1,2,3,8,11,14,15,4] },
  'Chen': { name: 'Chen', color: '#8B5CF6', role: '前端开发', level: 4, levelName: '骨干', xp: 2890, projects: 5, badges: 7, joined: '2024年10月', bio: '全栈开发者，热爱开源。擅长 React / Vue / Node.js，追求极致的用户体验。', skills: [{name:'React',pct:90},{name:'Vue',pct:85},{name:'Node.js',pct:78},{name:'CSS',pct:88},{name:'TypeScript',pct:82},{name:'团队协作',pct:75}], earnedBadges: [0,1,2,3,6,15,9] },
  'Yuki': { name: 'Yuki', color: '#F97316', role: '设计师', level: 3, levelName: '建设者', xp: 1120, projects: 3, badges: 5, joined: '2024年12月', bio: 'UI/UX 设计师，喜欢极简风格。Figma 重度用户，相信设计能解决问题。', skills: [{name:'UI设计',pct:88},{name:'交互设计',pct:82},{name:'Figma',pct:92},{name:'用户研究',pct:70},{name:'品牌设计',pct:65},{name:'团队协作',pct:72}], earnedBadges: [0,1,2,3,5] },
  'Alex': { name: 'Alex', color: '#0EA5E9', role: '后端开发', level: 3, levelName: '建设者', xp: 980, projects: 3, badges: 4, joined: '2025年1月', bio: '后端工程师，专注高并发系统设计。Go / Python / PostgreSQL。', skills: [{name:'Go',pct:85},{name:'Python',pct:80},{name:'PostgreSQL',pct:78},{name:'系统设计',pct:75},{name:'API设计',pct:82},{name:'团队协作',pct:68}], earnedBadges: [0,1,2,3] },
  'Lina': { name: 'Lina', color: '#D4213D', role: '产品经理', level: 2, levelName: '创客', xp: 380, projects: 1, badges: 3, joined: '2025年3月', bio: '转行做产品经理的前运营人。喜欢研究用户心理，正在公社积累第一个完整项目经验。', skills: [{name:'需求分析',pct:55},{name:'用户调研',pct:60},{name:'竞品分析',pct:50},{name:'团队协作',pct:65},{name:'PRD撰写',pct:40},{name:'数据分析',pct:45}], earnedBadges: [0,1,3] },
  'Wang': { name: 'Wang', color: '#F59E0B', role: '产品经理', level: 3, levelName: '建设者', xp: 1050, projects: 2, badges: 5, joined: '2024年11月', bio: 'AI 产品经理，对知识管理有执念。正在做一款让自己也用的知识图谱工具。', skills: [{name:'AI产品',pct:80},{name:'需求分析',pct:75},{name:'数据分析',pct:72},{name:'竞品分析',pct:70},{name:'PRD撰写',pct:68},{name:'团队协作',pct:78}], earnedBadges: [0,1,2,3,15] },
  'Mia': { name: 'Mia', color: '#10B981', role: '设计师', level: 2, levelName: '创客', xp: 420, projects: 1, badges: 3, joined: '2025年2月', bio: '视觉设计师，擅长数据可视化。加入公社是为了认识更多有趣的人。', skills: [{name:'数据可视化',pct:78},{name:'UI设计',pct:72},{name:'Figma',pct:80},{name:'插画',pct:65},{name:'团队协作',pct:60}], earnedBadges: [0,1,3] },
  'Zhang': { name: 'Zhang', color: '#6366F1', role: '前端开发', level: 2, levelName: '创客', xp: 350, projects: 1, badges: 3, joined: '2025年3月', bio: '前端开发新人，正在通过公社项目积累实战经验。', skills: [{name:'React',pct:60},{name:'CSS',pct:65},{name:'JavaScript',pct:58},{name:'团队协作',pct:55}], earnedBadges: [0,1,3] },
  'Sisi': { name: 'Sisi', color: '#EC4899', role: '发起人', level: 1, levelName: '新社员', xp: 50, projects: 1, badges: 1, joined: '2025年4月', bio: '大学生，对创业充满热情。发起了二手交换平台项目，正在寻找队友。', skills: [{name:'用户调研',pct:30},{name:'产品设计',pct:25},{name:'团队协作',pct:35}], earnedBadges: [0] },
  'Han': { name: 'Han', color: '#0EA5E9', role: '产品经理', level: 2, levelName: '创客', xp: 280, projects: 1, badges: 2, joined: '2025年4月', bio: '关注适老化设计的产品经理。希望用技术帮助老年人更好地生活。', skills: [{name:'用户调研',pct:55},{name:'需求分析',pct:50},{name:'适老化设计',pct:45},{name:'团队协作',pct:50}], earnedBadges: [0,1] },
  'Qi': { name: 'Qi', color: '#A855F7', role: '游戏策划', level: 3, levelName: '建设者', xp: 890, projects: 2, badges: 4, joined: '2024年12月', bio: '独立游戏开发者，像素艺术爱好者。正在做一款像素风农场经营游戏。', skills: [{name:'游戏设计',pct:82},{name:'关卡设计',pct:75},{name:'像素美术',pct:60},{name:'Godot',pct:70},{name:'团队协作',pct:72}], earnedBadges: [0,1,2,3] },
  'Tao': { name: 'Tao', color: '#22C55E', role: '像素美术', level: 2, levelName: '创客', xp: 310, projects: 1, badges: 2, joined: '2025年1月', bio: '像素艺术家，擅长16-bit风格的角色和场景设计。', skills: [{name:'像素角色',pct:80},{name:'像素场景',pct:75},{name:'动画',pct:65},{name:'团队协作',pct:55}], earnedBadges: [0,1] },
  'Ning': { name: 'Ning', color: '#EAB308', role: '游戏开发', level: 2, levelName: '创客', xp: 260, projects: 1, badges: 2, joined: '2025年2月', bio: 'Godot 引擎开发者，热爱独立游戏。', skills: [{name:'Godot',pct:72},{name:'GDScript',pct:68},{name:'游戏物理',pct:60},{name:'团队协作',pct:55}], earnedBadges: [0,1] },
  'Kevin': { name: 'Kevin', color: '#4A90D9', role: '后端开发', level: 2, levelName: '创客', xp: 320, projects: 1, badges: 3, joined: '2025年3月', bio: '后端开发工程师，擅长 Node.js 和数据库设计。', skills: [{name:'Node.js',pct:70},{name:'MongoDB',pct:65},{name:'API设计',pct:68},{name:'团队协作',pct:60}], earnedBadges: [0,1,3] },
  'Rui': { name: 'Rui', color: '#EF4444', role: '前端开发', level: 2, levelName: '创客', xp: 290, projects: 1, badges: 3, joined: '2025年1月', bio: '前端开发者，擅长动画和交互效果。', skills: [{name:'CSS动画',pct:78},{name:'React',pct:65},{name:'Three.js',pct:55},{name:'团队协作',pct:58}], earnedBadges: [0,1,3] },
};

