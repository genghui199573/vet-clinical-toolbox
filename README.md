# Vet Clinical Toolbox 5.0

兽医临床工具箱——固定产品版本 5.0。项目保持纯 HTML5 / CSS3 / 原生 JavaScript ES6，无 Vue/React 重型框架。

## 5.0-r08 核心更新

- 单一 `patientState` 与全局 `CustomEvent` 状态同步。
- Clinical Rules Engine：单位、输入校验、物种/品种安全锁、临床红线。
- 休克分次 Bolus、Na/KCl 安全边界、低白蛋白校正 AG、血气温度校正。
- CPR 剂量卡、制剂浓度换算、100–120 bpm 节拍器、2 分钟语音提醒。
- VHS/VLAS/ACVIM、IRIS CKD、积液鉴别、局麻 LADD、催吐、ILE、UOP、NaHCO₃/KCl、DKA、BSA/化疗、ISCAID、A4 打印、药物安全审计。
- PWA 离线缓存采用内部 `5.0-r08` revision；用户可见产品版本仍固定为 5.0。
- `tests/smoke.mjs` + GitHub Actions 用于基础回归检查。

## 重要原则

临床工具只提供决策支持。药品标签、实际实验室报告、患者动态监测结果、本院 protocol 和当前专业指南优先。高风险药物、输液、CPR、解毒、DKA、化疗和电解质处方必须由执业兽医独立复核。
