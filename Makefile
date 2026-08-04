# ============================================================
# Makefile - OpenPanda 项目管理（make 命令备选方案）
#
# 用法:
#   make dev         启动前端开发服务器
#   make build       编译后端 Linux 二进制
#   make docker      构建 Docker 镜像
#   make up          启动所有服务
#   make release     构建并推送 Docker 镜像
# ============================================================

.PHONY: dev build docker up down push release clean

# ---------- 开发 ----------
dev:
	cd Frontend && npm run dev

dev-backend:
	cd Backend && go run main.go

# ---------- 编译 ----------
# 交叉编译为 Linux 静态二进制（Docker 用）
build:
	cd Backend && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o server main.go

# 编译本地版本（Windows 开发调试用）
build-local:
	cd Backend && go build -o server.exe main.go

# ---------- Docker ----------
docker: 
	docker build -t crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-backend:latest ./Backend
	docker build -t crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-frontend:latest ./Frontend

docker-backend:
	docker build -t crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-backend:latest ./Backend

docker-frontend:
	docker build -t crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-frontend:latest ./Frontend

up:
	docker-compose -f deploy/docker-compose.yml up -d

down:
	docker-compose -f deploy/docker-compose.yml down

logs:
	docker-compose -f deploy/docker-compose.yml logs -f

# ---------- 发布 ----------
push:
	docker push crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-backend:latest
	docker push crpi-c5c3flmci79oobwt.cn-shanghai.personal.cr.aliyuncs.com/clintonluo/openpanda-frontend:latest

release: docker push

# ---------- 清理 ----------
clean:
	rm -f Backend/server Backend/server.exe
	rm -rf Frontend/dist

upto-server:
	scp -r deploy/* root@139.224.197.152:/root/openPanda