# 票务系统故障排除指南

## 问题 1: 登录功能显示"网络错误，请稍后重试"

### 原因
API URL 配置不正确。在 Docker 容器环境中，客户端容器无法访问 `localhost:8001`。

### 解决方案

#### 方案 A: 使用 Docker Compose（推荐）
```bash
cd projects/s3
docker-compose down  # 停止旧容器
docker-compose up -d  # 启动新容器
```

**关键配置已修复：**
- `docker-compose.yml` 中的 `VITE_API_URL` 已更新为 `http://server:8000`
- `client/src/api/index.ts` 现在使用环境变量 `VITE_API_URL`

#### 方案 B: 本地开发（不使用 Docker）
```bash
# 终端 1: 启动后端服务器
cd projects/s3/server
npm install
npm start

# 终端 2: 启动前端开发服务器
cd projects/s3/client
npm install
npm run dev
```

前端将在 `http://localhost:5173` 运行，后端在 `http://localhost:8001`

### 验证修复
1. 打开浏览器访问 `http://localhost:5174`（Docker）或 `http://localhost:5173`（本地）
2. 使用测试账号登录：
   - 用户名: `admin` 密码: `admin123`
   - 用户名: `zhangsan` 密码: `123456`
3. 如果登录成功，说明网络连接已修复

---

## 问题 2: 其他功能显示网络错误

### 常见原因

| 问题 | 原因 | 解决方案 |
|------|------|--------|
| 活动列表加载失败 | 后端服务未启动 | 检查 `docker ps` 或重启服务 |
| 座位选择无响应 | API 超时 | 增加超时时间或检查网络 |
| 订单创建失败 | 数据库未初始化 | 运行 `npm run seed` |
| 优惠券验证失败 | 优惠券数据缺失 | 重置系统或检查数据库 |

### 调试步骤

#### 1. 检查容器状态
```bash
docker ps
docker logs projects-s3-server-1
docker logs projects-s3-client-1
```

#### 2. 检查网络连接
```bash
# 从客户端容器测试后端连接
docker exec projects-s3-client-1 curl http://server:8000/api/events
```

#### 3. 检查数据库
```bash
# 查看数据库文件
cat projects/s3/server/data/db.json

# 重新初始化数据库
docker exec projects-s3-server-1 npm run seed
```

---

## 问题 3: Docker 容器无法启动

### 解决方案
```bash
# 清理所有容器和镜像
docker-compose down -v
docker system prune -a

# 重新构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

---

## 问题 4: 端口已被占用

### 解决方案
```bash
# 查找占用端口的进程
lsof -i :5174  # 前端端口
lsof -i :8001  # 后端端口

# 杀死进程
kill -9 <PID>

# 或修改 docker-compose.yml 中的端口映射
# 例如: "5175:5173" 改为 "5175:5173"
```

---

## 问题 5: 前端无法连接到后端

### 检查清单
- [ ] 后端服务已启动（`docker ps` 显示 server 容器）
- [ ] 前端环境变量正确（`VITE_API_URL=http://server:8000`）
- [ ] Docker 网络已创建（`docker network ls` 显示 ticketing-network）
- [ ] 防火墙未阻止容器通信

### 快速修复
```bash
# 重启 Docker 服务
docker-compose restart

# 或完全重建
docker-compose down
docker-compose up -d --build
```

---

## 环境变量配置

### Docker 环境
```yaml
# docker-compose.yml
environment:
  - VITE_API_URL=http://server:8000
```

### 本地开发环境
创建 `.env` 文件（可选）：
```
VITE_API_URL=http://localhost:8001
```

### 生产环境
```
VITE_API_URL=https://api.yourdomain.com
```

---

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| zhangsan | 123456 | 普通用户 |
| lisi | 123456 | 普通用户 |

---

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f server
docker-compose logs -f client

# 重启服务
docker-compose restart

# 进入容器
docker exec -it projects-s3-server-1 sh
docker exec -it projects-s3-client-1 sh

# 查看容器状态
docker ps
docker stats
```

---

## 获取帮助

如果问题仍未解决，请检查：
1. 后端日志：`docker-compose logs server`
2. 前端控制台：浏览器开发者工具 (F12)
3. 网络请求：浏览器 Network 标签
4. 数据库文件：`projects/s3/server/data/db.json`

