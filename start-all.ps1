# 同时启动前后端脚本
# 使用 Start-Process 启动前端和后端服务

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendPath = Join-Path $ScriptPath "frontend"
$BackendPath = Join-Path $ScriptPath "backend"

if (-not (Test-Path $FrontendPath)) {
    Write-Host "错误: 找不到 frontend 目录: $FrontendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackendPath)) {
    Write-Host "错误: 找不到 backend 目录: $BackendPath" -ForegroundColor Red
    exit 1
}

Write-Host "正在启动前端和后端服务..." -ForegroundColor Cyan

$FrontendScript = Join-Path $ScriptPath "start-frontend.ps1"
$BackendScript = Join-Path $ScriptPath "start-backend.ps1"

Write-Host "启动前端开发服务器..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "`"$FrontendScript`"" -WindowStyle Normal

Write-Host "启动后端 Spring Boot 应用..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "`"$BackendScript`"" -WindowStyle Normal

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "前端和后端服务正在启动中!" -ForegroundColor Green
Write-Host "前端服务地址: http://localhost:5173" -ForegroundColor Green
Write-Host "后端服务地址: http://localhost:8080" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出此窗口（服务将继续在后台运行）..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
