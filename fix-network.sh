#!/bin/bash

# 票务系统网络连接修复脚本
# 用于快速修复登录和网络错误问题

set -e

echo "🔧 票务系统网络连接修复工具"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓ Docker 已安装${NC}"

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose 已安装${NC}"
echo ""

# 进入项目目录
cd "$(dirname "$0")" || exit 1

echo "📁 项目目录: $(pwd)"
echo ""

# 停止旧容器
echo -e "${YELLOW}⏹️  停止旧容器...${NC}"
docker-compose down 2>/dev/null || true
sleep 2

# 清理旧镜像（可选）
echo -e "${YELLOW}🧹 清理旧镜像...${NC}"
docker system prune -f --filter "label!=keep" 2>/dev/null || true

# 构建新镜像
echo -e "${YELLOW}🔨 构建新镜像...${NC}"
docker-compose build --no-cache

# 启动容器
echo -e "${YELLOW}🚀 启动容器...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 5

# 检查容器状态
echo ""
echo -e "${YELLOW}📊 检查容器状态...${NC}"
docker-compose ps

# 测试后端连接
echo ""
echo -e "${YELLOW}🧪 测试后端连接...${NC}"
if docker exec projects-s3-server-1 curl -s http://localhost:8000/api/events > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务正常${NC}"
else
    echo -e "${RED}❌ 后端服务异常${NC}"
fi

# 显示访问信息
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ 修复完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📱 访问应用:"
echo "  前端: http://localhost:5174"
echo ""
echo "🔐 测试账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "  用户名: zhangsan"
echo "  密码: 123456"
echo ""
echo "📋 查看日志:"
echo "  docker-compose logs -f server"
echo "  docker-compose logs -f client"
echo ""
echo "🛑 停止服务:"
echo "  docker-compose down"
echo ""

