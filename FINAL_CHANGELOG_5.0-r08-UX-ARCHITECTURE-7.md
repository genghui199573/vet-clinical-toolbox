# Vet Clinical Toolbox 5.0-r08 · UX / Architecture 7

## 本次优化

### 1. 修复首页布局遮挡与结构错位
- 全局患者工作台从原首页内部双栏 grid 中提升为独立全宽工作区。
- 临床指挥台改为首页主卡片之后的独立区块，避免被数据库卡片挤压。
- Header 增加全局患者条后，导航栏自动读取 Header 实际高度，不再使用固定 top 值造成遮挡。
- 响应式断点重新处理：桌面、平板、手机均按单列/双列自然收缩。

### 2. 修复导航重复/堆叠问题
- 原架构层只是把分组复制到 nav 后方，旧的 20+ 个按钮仍然留在原位置，造成菜单重复和视觉拥挤。
- 新版本直接重建 nav DOM：每个入口只出现一次，并按临床工作流分组。

### 3. 降低首次上手成本
首页临床指挥台现在明确给出：
1. 建立患者
2. 判断风险
3. 形成问题
4. 执行与复评

并提供快速打开工具搜索，例如：血气、剂量、猫传腹、麻醉、AI 等。

### 4. 增加快速工具检索
- 首页新增“快速打开工具”。
- 支持模块关键词和常见临床关键词映射。
- 疾病关键词优先进入疾病方案；症状关键词优先进入鉴别诊断。
- `Ctrl/Cmd + K` 可直接打开首页工具搜索。

### 5. 患者状态继续保持单一事实源
- 保留 `vct50_patient_state` 为主状态。
- 继续同步旧版 `vetPatientState5`，兼容旧规则引擎。
- 患者无编号时自动生成 Patient ID。
- 保持 5.0-r08，不做数据迁移。

### 6. Service Worker
- 内部缓存 revision 从 architecture6 更新为 architecture7。
- 产品版本仍然为 5.0-r08。

## 验证
全部现有测试通过：
- smoke
- AI bridge
- clinical core
- clinical OS
- drug/protocol
- lab reference
- patient/AI integration
- patient state
- workstation
