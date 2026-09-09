# 内容导入导出

## 管理入口

管理员登录后访问 `/admin/content-transfer`。

- **导出全部内容**：下载一个 ZIP，包含文章 Markdown、`manifest.json` 和文章引用的本地图片。
- **导入 ZIP**：仅接受 OpenPanda 导出格式，导入前会校验清单、文件路径、资源类型和 SHA-256。
- **导入 Markdown**：先上传预览，再补充标题、Slug、摘要、分类、标签和语言，最后确认创建草稿。

后端接口：

```text
GET  /api/v1/admin/content/export
POST /api/v1/admin/content/import/zip
POST /api/v1/admin/content/preview/markdown
POST /api/v1/admin/content/import/markdown
```

所有接口都要求管理员 JWT。

## ZIP 格式

```text
openpanda-export.zip
├── manifest.json
├── articles/
│   ├── 001-first-post.md
│   └── ...
└── resources/images/
    ├── <hash>.png
    └── ...
```

文章中的站内图片：

```markdown
![示意图](/uploads/2026/09/example.png)
```

导出后会改成 ZIP 内的相对路径：

```markdown
![示意图](../resources/images/<hash>.png)
```

重新导入后会生成新的 `/uploads/YYYY/MM/<unique-file>` 路径，并同步改写文章正文和封面图路径。外部图片 URL 不会被服务器主动下载。

## Markdown 导入

可以直接上传普通 Markdown：

```markdown
# 文章标题

正文内容
```

也可以使用 Front Matter：

```yaml
---
title: STM32 时钟树
slug: stm32-clock
summary: 文章摘要
language: zh
category: mcu-development
tags: STM32, 时钟
---
正文内容
```

上传后先调用预览接口，不写数据库；用户在页面补全信息后，确认接口才创建文章。单 Markdown 导入始终是草稿和私有文章。图片资源应使用包含 `resources/images/` 的完整 ZIP。

## 安全限制

- ZIP 最大 100MB，解压总量最大 300MB，最多 2000 个文件。
- 拒绝绝对路径、`..` 路径、反斜杠和 Windows 盘符路径。
- 资源仅允许放在 `resources/images/`，扩展名限制为 png/jpg/jpeg/gif/webp。
- 资源必须通过 manifest 中的 SHA-256 校验。
- 已有文章不会被覆盖，重复 slug 自动追加 `-import-2` 等后缀。
- 已有图片不会被覆盖，导入失败会清理本次新增文件和数据库记录。

## 部署

后端和前端必须一起重新构建并发布；仅重启旧容器不会出现新接口和页面。Nginx 已配置 101MB 请求体上限，后端 ZIP 限制为 100MB。生产环境发布前应先备份 PostgreSQL 和 `/data/openpanda/uploads/`，并在测试文章上执行一次导出—导入—资源 URL 检查。