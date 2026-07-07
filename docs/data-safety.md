# 数据安全与备份指南

## 数据存储位置

所有持久化数据存储在宿主机 **`/data/openpanda/`** 下，使用 Docker bind mount 而非命名卷：

```
/data/openpanda/
├── pgdata/          # PostgreSQL 数据库文件
│   └── ...          # 所有文章、分类、标签、配置等
├── uploads/         # 上传的图片
│   ├── 2026/01/
│   ├── 2026/06/
│   └── ...
├── redis/           # Redis 缓存（可重建，非核心）
│   └── dump.rdb
└── backups/         # 数据库备份文件
    ├── backup-20260626.sql
    └── ...
```

## 为什么用 bind mount

| 方式 | 删除容器 | 删除 Docker | 数据位置 |
|------|----------|-------------|----------|
| Docker 命名卷 | 保留（除非 `-v`） | **丢失** | Docker 内部管理 |
| **bind mount** ✅ | 保留 | **保留** | 宿主机明确定路径 |

即使完全卸载 Docker，`/data/openpanda/` 下的数据也不会丢失。

## 服务器首次部署

```bash
# 1. 创建持久化目录
mkdir -p /data/openpanda/{pgdata,uploads,backups}

# 2. 启动
cd /opt/openpanda
docker-compose -p openpanda -f deploy/docker-compose.prod.yml up -d
```

## 软件更新流程

```bash
cd /opt/openpanda

# 拉取新镜像（不影响数据）
docker-compose -p openpanda -f deploy/docker-compose.prod.yml pull

# 重建容器（volume 数据保留）
docker-compose -p openpanda -f deploy/docker-compose.prod.yml up -d

# 确认数据完好
ls /data/openpanda/pgdata/
ls /data/openpanda/uploads/
```

## 数据库备份

### 手动备份

```bash
docker exec openpanda-db pg_dump -U postgres openpanda \
  > /data/openpanda/backups/backup-$(date +%Y%m%d).sql
```

### 手动恢复

```bash
# 确保数据库容器在运行
docker exec -i openpanda-db psql -U postgres openpanda \
  < /data/openpanda/backups/backup-20260626.sql
```

### 定时自动备份（crontab）

```bash
crontab -e

# 每天凌晨 2 点备份，保留最近 30 天
0 2 * * * docker exec openpanda-db pg_dump -U postgres openpanda > /data/openpanda/backups/backup-$(date +\%Y\%m\%d).sql && find /data/openpanda/backups/ -name '*.sql' -mtime +30 -delete
```

## 图片备份

```bash
# 整目录 rsync 到另一台机器或云存储
rsync -av /data/openpanda/uploads/ backup-server:/backups/openpanda-uploads/

# 或打包压缩
tar -czf /tmp/uploads-$(date +%Y%m%d).tar.gz -C /data/openpanda uploads/
```

## 完整灾难恢复

假设服务器完全重装，从头恢复：

```bash
# 1. 确保 /data/openpanda/ 数据目录完好（如已挂载数据盘）
ls /data/openpanda/

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 3. 拿到部署文件
scp -r deploy/ root@server:/opt/openpanda/
cd /opt/openpanda

# 4. 启动全部服务
docker-compose -p openpanda -f deploy/docker-compose.prod.yml up -d

# 5. 如需恢复数据库
docker exec -i openpanda-db psql -U postgres openpanda \
  < /data/openpanda/backups/backup-最新日期.sql
```

## 安全建议

| 建议 | 说明 |
|------|------|
| `/data` 挂载独立数据盘 | 系统盘损坏不影响数据 |
| 每日自动备份 | crontab + pg_dump |
| 备份异地存储 | rsync 到另一台机器/云存储 |
| JWT_SECRET 更换 | 修改 `.env` 中 JWT_SECRET（或 deploy/docker-compose.prod.yml） |
| DB_PASSWORD 更换 | 生产环境务必改掉默认 `postgres` |
