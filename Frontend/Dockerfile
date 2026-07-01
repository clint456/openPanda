# ============================================================
# Frontend Dockerfile - Vite + Vue3 前端服务（Nginx 部署）
# 多阶段构建：Node 编译 → Nginx 托管
# ============================================================

# -------------------- 阶段1: 编译 --------------------
FROM node:20-alpine AS builder

# 设置 npm 镜像（国内加速，海外部署可删除）
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 先复制依赖文件（利用 Docker 缓存层）
COPY package.json package-lock.json* ./
RUN npm install

# 复制所有源代码
COPY . .

# 构建生产版本
RUN npm run build

# -------------------- 阶段2: Nginx 运行 --------------------
FROM nginx:1.25-alpine

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从编译阶段复制构建产物到 Nginx 静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建 SSL 证书目录
RUN mkdir -p /etc/nginx/ssl

# 暴露端口
EXPOSE 80
EXPOSE 443

# 启动 Nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
