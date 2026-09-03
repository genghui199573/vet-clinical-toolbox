# Vet Clinical Toolbox 5.0-r08 · Final Clinical Core Upgrade

## 本次核心升级
- Patient State 2.0：统一患者上下文作为临床模块共享入口。
- 临床总览 Dashboard：患者、关键指标、当前问题、用药风险、住院趋势。
- 急诊驾驶舱：ABCDE 分诊、高钾、低血糖、呼吸危重、癫痫持续状态红旗。
- Critical/Red-Flag Engine：从患者主诉与关键指标生成优先级提示。
- 综合实验室模式引擎：CBC/肝胆/肾脏/电解质/血糖/乳酸等模式筛查。
- 用药安全审计：将当前用药与肾功能、高钾及典型高风险组合联动。
- 住院监测趋势：保存患者快照并比较体重、Cr、K、Na、Alb。
- 结构化胸腹部影像报告模板。
- PWA Service Worker 纳入 clinical_core_5.0.js，并更新内部缓存 revision；产品版本仍为 5.0-r08。
- 增加 clinical core 集成测试。

## 安全边界
- 所有红旗、阈值和模式均为临床辅助筛查，不替代诊断。
- 药物剂量必须核对具体制剂官方标签、种属、个体状态及权威兽医资料。
- 液体、输血、CPR、急诊和麻醉均应遵循医院 protocol 与当前指南。

## 验证
- smoke: OK
- drug/protocol: OK（427 drug leaflets, 10 disease protocols）
- patient state: OK
- clinical workstation: OK（54+ protocol templates）
- clinical core: OK
