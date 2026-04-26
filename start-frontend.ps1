# 前端启动脚本
# 切换到 frontend 目录并启动开发服务器

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendPath = Join-Path $ScriptPath "frontend"

if (-not (Test-Path $FrontendPath)) {
    Write-Host "错误: 找不到 frontend 目录: $FrontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "正在启动前端开发服务器..." -ForegroundColor Cyan
Set-Location $FrontendPath

if (-not (Test-Path "package.json")) {
    Write-Host "错误: 找不到 package.json 文件" -ForegroundColor Red
    exit 1
}

npm run dev

if ($LASTEXITCODE -eq 0) {
    Write-Host "前端开发服务器启动成功!" -ForegroundColor Green
} else {
    Write-Host "前端开发服务器启动失败" -ForegroundColor Red
    exit $LASTEXITCODE
}
