# Vet Clinical Toolbox 5.0-r08 · Clinical OS 3 / AI Review Workflow

## 本次升级
- AI Clinical Plan 改为 staged review：AI 生成后不再自动写入 Clinical OS。
- AI 计划保留 Suggested（建议）状态，医生明确点击“应用临床计划”后才进入 Clinical OS。
- “同步到患者”与“拒绝本次计划”统一使用事件委托，支持 AI 结果区与 AI Plan Inbox。
- AI 按钮增加明确点击态、禁用态与 z-index/pointer-events 防护。
- Patient Dashboard（患者驾驶舱）加入 Clinical OS：紧急程度、问题数、待办数、AI计划状态、红旗入口。
- Dashboard 支持移动端单列布局，减少首页和临床工作区信息拥挤。
- Service Worker cache revision 更新为 architecture8；产品版本仍为 5.0-r08。

## 临床安全原则
AI 输出始终是 Suggested（建议），不自动成为诊断、医嘱或已执行操作。用药、液体、麻醉、输血等高风险决策必须结合物种、体重、器官功能、制剂标签及当前指南由执业兽医核验。

## 验证
- AI bridge validation: OK
- Clinical OS validation: OK
- Patient/AI integration regression: OK
- Smoke validation: OK
- Clinical core validation: OK
- Drug/protocol validation: OK (427 drug leaflets, 10 disease protocols)
- Lab reference / glucose unit validation: OK
- Patient state validation: OK
- Clinical workstation validation: OK (54+ templates)
- JS syntax: OK
- Static duplicate IDs: 0
