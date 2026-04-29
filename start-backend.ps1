# 后端启动脚本
# 切换到 backend 目录并启动 Spring Boot 应用

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ScriptPath "backend"

if (-not (Test-Path $BackendPath)) {
    Write-Host "错误: 找不到 backend 目录: $BackendPath" -ForegroundColor Red
    exit 1
}

Write-Host "正在启动后端 Spring Boot 应用..." -ForegroundColor Cyan
Set-Location $BackendPath

# 加载 .env 环境变量
$EnvFile = Join-Path $BackendPath ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $val)
        }
    }
    Write-Host "已加载环境变量: $EnvFile" -ForegroundColor DarkGray
} else {
    Write-Host "警告: 未找到 $EnvFile，请从 .env.example 复制并配置" -ForegroundColor Yellow
}

if (-not (Test-Path "pom.xml")) {
    Write-Host "错误: 找不到 pom.xml 文件" -ForegroundColor Red
    exit 1
}

mvn spring-boot:run

if ($LASTEXITCODE -eq 0) {
    Write-Host "后端 Spring Boot 应用启动成功!" -ForegroundColor Green
} else {
    Write-Host "后端 Spring Boot 应用启动失败" -ForegroundColor Red
    exit $LASTEXITCODE
}
