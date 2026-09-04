# VCT Clinical Pet 5.0-r08 — Clinical Intelligence Upgrade

## 目标
将兽医临床工具箱从“工具集合”升级为以 Patient State / Encounter 为中心的临床决策工作流，同时保持产品版本号 **5.0-r08** 不变。

## 本版新增
1. Patient-centered Clinical Workflow
2. Emergency Cockpit 2.0（ABCDE）
3. Dynamic Red Flag Engine
4. Trend Engine
5. Reassessment Engine
6. Fluid as Drug 2.0 / I&O balance
7. Medication Safety 2.0 / Safety Gate
8. Next Best Test（启发式排序，非概率模型）
9. Differential Engine 2.0（支持/反对/缺失证据）
10. Antimicrobial Stewardship 2.0 / Timeout
11. Pain 2.0
12. Daily Rounds
13. POMR 2.0
14. Imaging Workstation structured-report framework
15. Specialty Frameworks：急诊、内科、心脏、肾脏、胃肠、神经、肿瘤、皮肤、内分泌、传染病、眼科、生殖、牙科、Exotic
16. Clinical Timeline / Audit

## 安全边界
- 不生成未经核验的固定药物剂量。
- AI/决策支持不自动执行处方、给药、收费、库存调整或消息发送。
- Medication Safety 要求剂量/制剂来源、适应证、禁忌、肝肾状态、联合用药和 Evidence Tier 复核。
- Fluid 输出包含数学计算与容量风险提示，不把计算结果当作治疗目标。
- Next Best Test / Differential 排序为临床启发式，不伪装成经过验证的概率模型。
- 抗菌药模块强调 indication、culture/susceptibility、de-escalation 与 stop/review date。
- 疼痛模块要求物种适用且经过验证的量表。
- Emergency 采用 ABCDE 优先，支持与病因诊断并行。

## 保留
- 427 个药物叶卡
- 10 个疾病方案
- Patient State
- Clinical OS / Clinical Core
- AI Clinical Copilot
- 病例归档 / 搜索 / 复诊
- AI 药物候选搜索（不写入正式药库）
- PWA / Service Worker / 本地导出恢复
- Hospital OS 基础框架

## 验证
- 全部 JavaScript `node --check`：通过
- Clinical Intelligence static validation：通过
- Drug/protocol：427 / 10：通过
- Patient State：通过
- AI Bridge：通过
- Case Archive + Follow-up + AI Drug Search：通过
- Hospital OS static：通过
- Clinical OS Complete：通过
- Lab Reference：通过
- Clinical Workstation：54+ 模板：通过
- Patient/AI integration：通过
- Live patient sync：通过
- Clinical Core：通过
- Clinical OS：通过
- Smoke：通过
