# Implementation Plan

## Goal Summary

实现书签导入/导出功能：支持 Chrome/Firefox HTML 导入、JSON 导入/导出、HTML 导出（兼容 Chrome）。

## Architecture

```
api/bookmarks/import          POST - 导入书签（支持 HTML/JSON）
api/bookmarks/export          GET - 导出书签（支持 JSON/HTML）
```

### 文件变更概览

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/routes/bookmarks.js` | 修改 | 添加 import/export 路由 |
| `src/controllers/importExportController.js` | 新增 | 导入导出控制器 |
| `src/services/parserService.js` | 新增 | HTML/JSON 解析服务 |
| `src/services/exporterService.js` | 新增 | 导出服务 |
| `src/middleware/upload.js` | 新增 | 文件上传中间件 |
| `src/utils/htmlParser.js` | 新增 | HTML 解析工具 |
| `tests/unit/import.test.js` | 新增 | 导入功能测试 |
| `tests/unit/export.test.js` | 新增 | 导出功能测试 |
| `docs/api.md` | 修改 | 更新 API 文档 |

---

## Task Breakdown

### Task 1: 文件上传中间件

**文件**: `src/middleware/upload.js`

- 配置 multer 用于文件上传
- 限制文件大小 10MB
-限制文件类型（.html, .json）
- 清理临时文件

**依赖**: 无
**验证**: `npm test`

### Task 2: HTML解析工具

**文件**: `src/utils/htmlParser.js`

- 解析 Chrome HTML 书签格式
- 解析 Firefox HTML 书签格式
- 提取 URL、标题、添加时间、文件夹路径
- 返回结构化数据 `{ url, title, addDate, folderPath }`

**依赖**: 无
**验证**: `npm test`

### Task 3: 解析服务

**文件**: `src/services/parserService.js`

- 统一入口处理 HTML/JSON 解析
- 检测浏览器类型（Chrome/Firefox）
- 返回标准化书签数据数组
- 检测重复 URL

**依赖**: Task 2
**验证**: `npm test`

### Task 4: 导出服务

**文件**: `src/services/exporterService.js`

- 生成 JSON 导出数据
- 生成 Chrome 兼容 HTML 导出
- 按标签创建文件夹层级
-格式化日期

**依赖**: 无
**验证**: `npm test`

### Task 5: 导入控制器

**文件**: `src/controllers/importExportController.js`

- `importBookmarks`: 处理文件上传，调用解析服务，批量插入书签
- 重复处理策略（跳过/覆盖）
- 返回导入结果统计

**依赖**: Task 1, Task 3
**验证**: `npm test`

### Task 6: 导出控制器

**文件**: `src/controllers/importExportController.js`

- `exportBookmarks`: 获取用户书签，调用导出服务
- 支持格式参数（json/html）
- 设置响应头和文件名

**依赖**: Task 4
**验证**: `npm test`

### Task 7: 路由配置

**文件**: `src/routes/bookmarks.js`

- 添加 `POST /import` 路由
- 添加 `GET /export` 路由
- 应用认证中间件

**依赖**: Task 5, Task 6
**验证**: `npm run lint && npm test`

### Task 8: API 文档更新

**文件**: `docs/api.md`

- 添加导入 API 文档
- 添加导出 API 文档
- 更新数据模型说明

**依赖**: Task 7
**验证**: 手动检查文档

---

## Task Dependencies

```
Task 1 (upload middleware)
       ↓
Task 2 (HTML parser) ──→ Task 3 (parser service)
                                  ↓
Task 4 (exporter service)          ↓
       ↑ ↓
Task 6 (export controller) ←───→ Task 5 (import controller)
       ↑                               ↑
       └─────── Task 7 (routes) ────────┘
                       ↓
               Task 8 (docs)
```

---

## Test Strategy

### 单元测试

| 测试文件 | 覆盖内容 |
|----------|----------|
| `tests/unit/htmlParser.test.js` | Chrome/Firefox HTML 解析 |
| `tests/unit/parserService.test.js` | 解析服务逻辑 |
| `tests/unit/exporterService.test.js` | JSON/HTML 导出 |
| `tests/unit/importExport.test.js` | 控制器集成测试 |

### 测试数据

- `tests/fixtures/chrome-bookmarks.html` - Chrome 导出的 HTML
- `tests/fixtures/firefox-bookmarks.html` - Firefox 导出的 HTML
- `tests/fixtures/bookmarks.json` - JSON 格式书签

### 验证命令

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testPathPattern=importExport

# 代码检查
npm run lint
```

---

## Acceptance Criteria Mapping

| AC ID | 验收标准 | 覆盖任务 |
|-------|----------|----------|
| AC-01 | Chrome HTML 导入 | Task 2, 3, 5 |
| AC-02 | Firefox HTML 导入 | Task 2, 3, 5 |
| AC-03 | JSON 导出 | Task 4, 6 |
| AC-04 | HTML 导出 | Task 4, 6 |
| AC-05 | 重复检测 | Task 3, 5 |
| AC-06 | 数据保留 | Task 3, 5 |
| AC-07 | 性能要求 | Task 5（批量处理优化） |
| AC-08 | 文件大小限制 | Task 1 |

---

## Known Risks

| 风险 | 描述 | 缓解措施 |
|------|------|----------|
| R-01 | HTML解析兼容性问题 | 创建多种测试用例覆盖边界情况 |
| R-02 | 大文件内存问题 | 使用流式处理，限制文件大小 |
| R-03 | 字符编码问题 | 强制 UTF-8，处理 BOM |
| R-04 | 重复 URL 处理策略 | 提供选项让用户选择 |

---

## Assumptions

- MongoDB 连接正常工作
- 用户上传的文件格式正确
- 文件上传使用 multipart/form-data
- 导出文件直接通过 HTTP 响应下载