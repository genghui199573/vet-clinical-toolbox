# 兽医临床工具箱 3.0：零服务器成本部署流程

## 推荐架构

GitHub Free 公共仓库
→ 保存 `data/drugs.json`
→ Cloudflare Pages 免费托管 `index.html`
→ 工具箱从你的公开 JSON 地址读取最新数据库

这样不需要购买 VPS、域名或传统服务器。

> 注意：GitHub Pages/公共仓库适合个人/非敏感资料。不要把病例、姓名、电话、病历号、处方记录等隐私数据放进公共仓库。

## 第一步：注册 GitHub

打开：
https://github.com/

注册一个账号并登录。

## 第二步：建立仓库

创建 New repository，例如：
`vet-clinical-toolbox`

建议先选 Public，因为 GitHub Free 的 Pages/公开静态站点功能最直接。

上传本项目：
- `index.html`
- `data/drugs.json`
- `data/sources.json`
- `.github/workflows/validate.yml`

## 第三步：取得在线 JSON 地址

上传完成后，数据库文件路径为：
`data/drugs.json`

可以使用 GitHub 的 raw 文件地址作为远程数据库地址。

例如：
`https://raw.githubusercontent.com/你的用户名/vet-clinical-toolbox/main/data/drugs.json`

将它复制下来。

## 第四步：免费部署网页

推荐 Cloudflare Pages。

打开：
https://pages.cloudflare.com/

注册/登录 Cloudflare。

创建 Pages 项目，连接你的 GitHub 仓库。

部署目录就是仓库根目录；因为项目已经有 `index.html`，不需要复杂构建。

Cloudflare 当前免费计划对静态资源请求免费且不限量；Pages Free 对站点文件数量、构建次数等有明确限制，但本工具箱远低于这些限制。

## 第五步：打开你的工具箱

部署完成后 Cloudflare 会给一个 `*.pages.dev` 地址。

打开它：
→ 点击“在线更新”
→ 粘贴你的 `raw.githubusercontent.com/.../data/drugs.json`
→ 点击“保存”
→ 点击“检查更新”

以后只要更新 GitHub 里的 `data/drugs.json`：
工具箱就可以重新读取最新数据库。

## 第六步：以后怎么更新药物

不要直接改 HTML。

只修改：
`data/drugs.json`

例如：
- 新增药物
- 修订剂量
- 修订适应症
- 添加禁忌症
- 添加不良反应
- 添加休药期
- 添加官方批准文号信息
- 修改来源

修改后提交 GitHub。

工具箱下一次检查更新时就能读取新版本。

## 第七步：3.0数据库审核规则

每一条剂量必须包含：
- 中文通用名
- 动物种类
- 适应症
- 给药途径
- 剂量/方案
- 来源
- 数据状态
- 证据等级

经济动物还必须增加：
- 适用动物
- 适应症
- 批准文号/产品
- 休药期
- 官方来源
- 最后核验日期

## 不建议

不要建立：
“AI自动搜索网页 → 自动把搜索结果变成剂量 → 自动发布”

正确流程：
官方资料/指南/论文
→ 数据提取
→ 人工审核
→ JSON
→ GitHub
→ 工具箱同步

## 关于费用

本方案的目标是 0 元基础设施成本：
- GitHub Free
- Cloudflare 免费计划
- Cloudflare Pages 提供静态资源托管

第三方服务的免费额度和条款可能变化，因此正式长期使用前应再次查看当前官方价格页面。

## 3.0下一步数据库扩充

当前只是种子数据库和架构。

建议继续扩充为：
1. 犬
2. 猫
3. 牛
4. 羊
5. 猪
6. 马
7. 鸡
8. 鸭
9. 鹅
10. 鸽
11. 鹦鹉
12. 其他鸟类
13. 龟
14. 蜥蜴
15. 蛇
16. 两栖类

并按抗菌、抗寄生虫、心血管、消化、肝胆、肾脏、内分泌、麻醉、镇痛、神经、眼科、耳科、皮肤、急救、输液、营养等建立药物分类。

