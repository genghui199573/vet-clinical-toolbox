# Vet Clinical Toolbox 5.0-r08 · Final Clinical OS 5

## 本轮最终优化
- 精简导航：将原有大量入口按“核心工作流 / 急诊与治疗 / 检验与诊断 / 药物与知识”折叠分组，减少视觉噪声；不删除原有模块。
- 合并 AI Plan 入口：取消独立 AI Plan 导航入口，AI 计划直接在 AI 临床助手工作区内审核，避免重复页面。
- 首页患者信息实时联动：Patient State 字段输入/修改后自动持久化并广播 `vct50:patient-change`，AI 患者上下文自动刷新。
- AI 不会因为自动刷新而自动生成诊疗建议；患者资料变化后提示医生重新分析病例。
- AI → Patient State 同步修复：当前有效 `vct50_patient_state.patientId` 为事实源；AI 可补充空白患者字段，但不会用 AI 结果覆盖活动患者身份。
- 同步后再次验证最终 Patient State，兼容 legacy `vetPatientState5`。
- 增加 `tests/test_patient_ai_live_sync.mjs`，覆盖实时患者→AI刷新、AI同步身份、导航折叠及 AI Plan 入口合并。

## 版本
- 固定：5.0-r08
- 不进行数据迁移。

## 保留数据
- 427 drug leaflets
- 10 disease protocols
- 纳百本地生化参考报告
- PWA/service worker
- Clinical OS / workstation / calculator modules
