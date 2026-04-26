/**
 * API 对接审计脚本
 *
 * 用法：node scripts/audit-api.js
 * 功能：
 *   1. 扫描 frontend/src/api/*.js 提取所有 API 调用（方法 + 路径）
 *   2. 扫描 backend controller 提取所有 REST 端点（方法 + 路径）
 *   3. 对比两端，输出未对接的接口清单
 *
 * 不需要启动服务，纯静态代码分析。
 */

const fs = require('fs')
const path = require('path')

// ── 前端 API 扫描 ──

function scanFrontendApis(apiDir) {
  const apis = []
  const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js') && f !== 'request.js' && f !== 'index.js')

  for (const file of files) {
    const content = fs.readFileSync(path.join(apiDir, file), 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(/request\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/)
      if (match) {
        apis.push({
          source: `frontend/api/${file}:${i + 1}`,
          method: match[1].toUpperCase(),
          path: match[2],
          exportName: extractExportName(lines, i),
        })
      }
    }
  }
  return apis
}

function extractExportName(lines, currentIndex) {
  for (let i = currentIndex; i >= Math.max(0, currentIndex - 10); i--) {
    const m = lines[i].match(/export\s+function\s+(\w+)/)
    if (m) return m[1]
  }
  return '(unknown)'
}

// ── 后端 Controller 扫描 ──

function scanBackendControllers(controllerDir) {
  const endpoints = []
  const files = fs.readdirSync(controllerDir).filter(f => f.endsWith('Controller.java'))

  for (const file of files) {
    const content = fs.readFileSync(path.join(controllerDir, file), 'utf-8')
    const classMatch = content.match(/@RequestMapping\s*\(\s*['"`]([^'"`]+)['"`]/)
    const basePath = (classMatch ? classMatch[1] : '').replace(/^\/?api\/?/i, '')

    // 匹配所有 HTTP 方法注解（有路径或无路径参数）
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const m = line.match(/@(Get|Post|Put|Delete|Patch)Mapping\s*(?:\(\s*(?:['"`]([^'"`]*)['"`])?\s*\))?/)
      if (m) {
        endpoints.push({
          source: `backend/controller/${file}`,
          method: m[1].toUpperCase(),
          path: basePath + (m[2] || ''),
        })
      }
    }
  }
  return endpoints
}

// ── 路径匹配 ──

function normalizePath(p) {
  return p
    .split('?')[0]                        // 去掉查询参数 ?xxx=yyy
    .replace(/^\/?api\/?/i, '')           // 去掉 /api 前缀
    .replace(/^\//, '')                    // 去掉开头的 /
    .replace(/\$\{[^}]+\}/g, ':param')     // ${xxx} → :param
    .replace(/\{[^}]+\}/g, ':param')       // {xxx} → :param（后端格式）
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase()
}

function findMatch(frontendApi, backendEndpoints) {
  const normFp = normalizePath(frontendApi.path)
  return backendEndpoints.find(be =>
    be.method === frontendApi.method && normalizePath(be.path) === normFp
  )
}

// ── 主逻辑 ──

const root = path.resolve(__dirname, '..')
const frontendApis = scanFrontendApis(path.join(root, 'frontend', 'src', 'api'))
const backendEndpoints = scanBackendControllers(
  path.join(root, 'backend', 'src', 'main', 'java', 'com', 'conlaboro', 'controller')
)

console.log('\n╔══════════════════════════════════════════════════╗')
console.log('║        Conlaboro API 对接审计报告                 ║')
console.log('╚══════════════════════════════════════════════════╝\n')

console.log(`前端 API 定义：${frontendApis.length} 个`)
console.log(`后端端点定义：${backendEndpoints.length} 个\n`)

const matched = []
const unmatchedFrontend = []

for (const fa of frontendApis) {
  const be = findMatch(fa, backendEndpoints)
  if (be) matched.push({ fa, be })
  else unmatchedFrontend.push(fa)
}

const unmatchedBackend = []
for (const be of backendEndpoints) {
  const found = frontendApis.some(fa =>
    fa.method === be.method && normalizePath(fa.path) === normalizePath(be.path)
  )
  if (!found) unmatchedBackend.push(be)
}

// ── 输出 ──

if (matched.length > 0) {
  console.log(`✅ 已对接 (${matched.length} 个)：`)
  for (const m of matched) {
    console.log(`   ${m.fa.method.padEnd(6)} ${m.fa.path.padEnd(48)} ← ${m.be.source.replace('backend/controller/', '')}`)
  }
  console.log('')
}

if (unmatchedFrontend.length > 0) {
  console.log(`❌ 前端调用但后端缺少 (${unmatchedFrontend.length} 个)：`)
  for (const uf of unmatchedFrontend) {
    console.log(`   ${uf.method.padEnd(6)} ${uf.path.padEnd(38)} [${uf.exportName}] 来自 ${uf.source}`)
  }
  console.log('')
} else {
  console.log('✅ 所有前端 API 都有对应的后端端点\n')
}

if (unmatchedBackend.length > 0) {
  console.log(`⚠️  后端存在但前端未调用 (${unmatchedBackend.length} 个)：`)
  for (const ub of unmatchedBackend) {
    console.log(`   ${ub.method.padEnd(6)} ${ub.path.padEnd(42)} 来自 ${ub.source}`)
  }
  console.log('')
} else {
  console.log('✅ 所有后端端点都已被前端使用\n')
}

const totalIssues = unmatchedFrontend.length + unmatchedBackend.length
if (totalIssues === 0) {
  console.log('🎉 审计通过！前后端接口完全对齐。')
} else {
  console.log(`⚠️  发现 ${totalIssues} 个对接问题需要处理。`)
  process.exit(1)
}
