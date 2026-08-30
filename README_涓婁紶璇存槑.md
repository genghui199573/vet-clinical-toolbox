兽医临床工具箱 5.0-r08 临床+代码双重审计修正版

版本：固定 5.0，不升级 5.1

需要操作：
1. 替换 clinical_rules_engine_5.0.js
2. 替换 sw.js
3. 新增 differential_diagnosis_5.0.js

不要删除任何现有核心文件、data/*.json、clinical_enhancements_5.0.js 或 clinical_enhancements_5.0_clinical_addon.js。

本次修正：
- Rules Engine 继续作为 patientState 单一事实源。
- MDR1/ABCB1 品种安全锁加入柯基/边牧等关键词。
- 保留猫对乙酰氨基酚/拟除虫菊酯 BLOCK 与恩诺沙星 >5 mg/kg/day 风险。
- 保留 Na 0.5 mEq/L/h、KCl 0.5 mEq/kg/h 等既有安全红线。
- 当前 RECOVER 2024 下，肾上腺素 0.1 mg/kg 仅保留为历史参考，不作为自动处方。
- 新增“系统性鉴别诊断 Atlas”，采用：症候/问题 → 病理生理类别 → 代表性鉴别 → 关键鉴别点 → 建议检查。
- 覆盖呼吸、消化、泌尿、心脏、神经、血液、电解质、肝胆、皮肤、感染/免疫等多个常见问题。
- sw.js 将新鉴别诊断模块纳入离线缓存，并提升缓存 revision；产品版本仍为 5.0。

GitHub 工具当前仍返回 403 Resource not accessible by integration，因此本次没有直接写入 GitHub；请把这三个文件上传到 main。
