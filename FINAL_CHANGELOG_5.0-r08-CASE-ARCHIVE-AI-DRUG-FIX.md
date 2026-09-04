# Vet Clinical Toolbox 5.0-r08 · Case Archive / Follow-up / AI Drug Search Fix

## 本次修复

1. **病例工作台保存 → Patient State → AI 临床助手**
   - 保存病例后将病例工作台作为当前患者输入源。
   - 同步宠物姓名、主人姓名、手机号、病历号、物种、品种、年龄、性别、体重、主诉、病史、基础病、诊断等。
   - 保存病例时清除上一位患者缓存的 AI 计划，避免旧病例分析继续显示。
   - AI 助手显示当前患者状态，并要求重新分析后生成新的建议。

2. **本地病例档案搜索**
   - localStorage 独立病例档案库。
   - 支持按宠物姓名、主人姓名、手机号、病历号、主诉等关键词检索。
   - 最多保留最近 500 条病例档案。
   - 保留原 `vetCase5` 兼容键。

3. **复诊工作流**
   - 打开历史病例。
   - 一键进入“复诊”模式。
   - 保留患者身份和历史治疗背景，清空本次检查/结果/医嘱输入区供本次复诊录入。
   - 每次保存形成 `visitHistory` 快照。

4. **AI 药物搜索**
   - 正式数据库仍优先使用本地 427 条药物资料。
   - 增加“AI药物搜索（本地格式）”。
   - AI 结果使用与正式药物数据库相同的本地化药物卡片布局。
   - AI 结果明确标记为 `AI Candidate / 待核验`。
   - 不自动写入正式 427 药物数据库。
   - 剂量、适应证、禁忌证、相互作用必须核对当前制剂官方标签/说明书或可靠指南。

5. **PWA**
   - Service Worker 已加入新模块并更新内部缓存版本。
   - 产品可见版本仍保持 **5.0-r08**。

## 回归测试

- smoke
- AI bridge
- clinical core
- clinical OS
- clinical OS complete
- drug/protocol：427 drug leaflets / 10 disease protocols
- lab reference
- patient/AI integration
- live patient sync + navigation
- patient state
- clinical workstation
- case archive + follow-up + AI drug search
