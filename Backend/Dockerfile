# ============================================================
# Backend Dockerfile - 极简单阶段
# 依赖本地预编译的 Linux 二进制（由 npm run build:backend 生成）
#
# 完整流程:
#   1. npm run build:backend       → 交叉编译 Linux 二进制到 Backend/server
#   2. npm run docker:build:backend → 打包进 Docker 镜像
# ============================================================
FROM alpine:3.19

# 安装 CA 证书（HTTPS 需要）和时区
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Shanghai

WORKDIR /app

# 直接复制预编译好的 Linux 二进制（npm run build:backend 产物）
COPY server .

EXPOSE 8080
CMD ["./server"]
