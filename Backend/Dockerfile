# ============================================================
# Backend Dockerfile — 多阶段构建，自动交叉编译 Linux 二进制
#
# 阶段1: Go 编译（容器内编译，自动适配 Linux 平台）
# 阶段2: 轻量运行镜像
#
# 不再需要手动 npm run build:backend！
# docker-compose build 即可一键构建。
# ============================================================

# -------------------- 阶段1: 编译 --------------------
FROM golang:1.21-alpine AS builder

# 设置 Go 代理（国内加速）
ENV GOPROXY=https://goproxy.cn,direct

WORKDIR /app

# 先复制依赖文件（利用 Docker 缓存层）
COPY go.mod go.sum ./
RUN go mod download

# 复制源码并编译为静态链接的 Linux 二进制
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o server main.go

# -------------------- 阶段2: 运行 --------------------
FROM alpine:3.19

# 安装 CA 证书（HTTPS 需要）和时区
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Shanghai

WORKDIR /app

# 从编译阶段复制二进制
COPY --from=builder /app/server .

EXPOSE 8080
CMD ["./server"]
