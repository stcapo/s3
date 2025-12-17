@echo off
REM 票务系统网络连接修复脚本 (Windows)
REM 用于快速修复登录和网络错误问题

setlocal enabledelayedexpansion

echo.
echo 🔧 票务系统网络连接修复工具
echo ================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装
    echo 请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✓ Docker 已安装
echo.

REM 检查 Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装
    pause
    exit /b 1
)

echo ✓ Docker Compose 已安装
echo.

REM 进入项目目录
cd /d "%~dp0"
echo 📁 项目目录: %cd%
echo.

REM 停止旧容器
echo ⏹️  停止旧容器...
docker-compose down 2>nul
timeout /t 2 /nobreak >nul

REM 清理旧镜像
echo 🧹 清理旧镜像...
docker system prune -f 2>nul

REM 构建新镜像
echo 🔨 构建新镜像...
docker-compose build --no-cache

REM 启动容器
echo 🚀 启动容器...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查容器状态
echo.
echo 📊 检查容器状态...
docker-compose ps

REM 显示访问信息
echo.
echo ================================
echo ✅ 修复完成！
echo ================================
echo.
echo 📱 访问应用:
echo   前端: http://localhost:5174
echo.
echo 🔐 测试账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo   用户名: zhangsan
echo   密码: 123456
echo.
echo 📋 查看日志:
echo   docker-compose logs -f server
echo   docker-compose logs -f client
echo.
echo 🛑 停止服务:
echo   docker-compose down
echo.

pause

