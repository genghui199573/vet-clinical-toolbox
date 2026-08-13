# 兽医临床工具箱 3.4 完整替换清单

## 必须替换
- `index.html`
- `data/drugs.json`
- `drugs.schema.v3.4.json`
- `sources.v3.4.json`
- `.github/workflows/validate.yml`

## 本版数据库
- 原有主数据库：405 条
- 新增官方核对的 2025—2026 年生物制品/疫苗：8 条
- 合计：413 条
- 不虚构疫苗剂量；没有可靠批准标签时保持 `dose: null`。

## 删除
- `drugs.schema.v3.2.json`
- `sources.v3.2.json`

## 暂时保留
- `sources.json`
- `README.md`
- `更新日志.md`
- `从零部署操作流程.md`
- `dose-calculator.html`
