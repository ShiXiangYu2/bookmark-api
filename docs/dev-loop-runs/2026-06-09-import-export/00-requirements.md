# Requirements Baseline

## Goal

实现书签导入/导出功能，支持用户从 Chrome/Firefox 导入书签，以及导出为 JSON/HTML 格式。

## Non-goals

- 不支持实时同步（仅手动导入/导出）
- 不支持浏览器插件自动导入
- 不支持增量同步（每次导出为完整快照）

## User-visible Behavior

### 导入功能

1. **Chrome HTML 导入**
   - 用户上传 Chrome 导出的 HTML 书签文件
   - 系统解析文件，提取 URL、标题、添加时间
   - 对于嵌套文件夹，自动创建对应的标签（如 `文件夹名/子文件夹`）
   - 返回导入结果（成功数量、失败数量、重复数量）

2. **Firefox HTML 导入**
   - 用户上传 Firefox 导出的 HTML 书签文件
   - 系统解析文件，提取 URL、标题、添加时间
   - 处理 Firefox 特定的 DOM 结构
   - 返回导入结果

3. **JSON导入**
   - 用户上传之前导出的 JSON 书签文件
   - 支持批量书签数据
   - 可选择覆盖或跳过已存在的书签（按 URL 判断重复）

### 导出功能

1. **JSON 导出**
   - 导出一个包含所有书签的 JSON 文件
   - 包含字段：url, title, description, tags, createdAt, starCount
   - 文件名格式：`bookmarks_export_YYYYMMDD.json`

2. **HTML 导出（兼容 Chrome）**
   - 导出 Chrome 可直接导入的 HTML 文件
   - 按标签创建文件夹层级
   - 文件名格式：`bookmarks_export_YYYYMMDD.html`

## Acceptance Criteria

| ID | 描述 | 验证方式 |
|----|------|----------|
| AC-01 | 可以上传 Chrome HTML 文件并成功导入书签 | 上传测试文件，验证书签数量 |
| AC-02 | 可以上传 Firefox HTML 文件并成功导入书签 | 上传测试文件，验证书签数量 |
| AC-03 | 可以导出 JSON 文件，文件格式正确 | 下载并解析 JSON |
| AC-04 | 可以导出 HTML 文件，Chrome 可导入 | 下载并用 Chrome 导入验证 |
| AC-05 | 重复书签可被检测并跳过或覆盖 | 测试重复 URL 的处理 |
| AC-06 | 导入时保留原始书签的标题和 URL | 验证导入后数据正确性 |
| AC-07 | API 响应时间< 30s（对于 1000 个书签） | 性能测试 |
| AC-08 | 文件上传大小限制为 10MB | 测试超大文件处理 |

## Constraints

- 文件上传限制：最大 10MB
- 支持的字符编码：UTF-8
- API 限流：每分钟 10 次导入/导出请求
- 导入书签数量无限制（但大文件可能超时）

## Assumptions

- 用户已登录并拥有有效的 API Key
- 书签 URL格式正确（HTTP/HTTPS）
- HTML 文件为标准浏览器导出格式
- MongoDB 索引已配置（现有配置保持不变）

## Open Questions

| ID | 问题 | 影响 |
|----|------|------|
| OQ-01 | 导入时如何处理书签描述？Chrome/Firefox HTML 通常不包含描述字段 | 低 - 描述留空或从页面抓取 |
| OQ-02 | 是否支持导入时指定目标用户？（管理员功能） | 低 - 默认导入到当前用户 |
| OQ-03 | 导出时是否包含其他用户的公开书签？ | 中 - 初始版本仅导出用户自己的书签 |

## Source Request

用户需要一个可靠的书签备份和迁移方案，能够：
1. 从 Chrome/Firefox 迁移现有书签
2. 备份当前书签到本地文件
3. 在不同账号间迁移书签

## Repo Context

- 项目路径：`/Volumes/mac/项目研发/项目自动化开发/bookmark-api`
- 技术栈：Node.js + Express + MongoDB + Mongoose
- 测试框架：Jest + mongodb-memory-server
- 代码规范：ESLint + Prettier
- 已有 API：认证 (X-API-Key)、书签 CRUD、标签管理