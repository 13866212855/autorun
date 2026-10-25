# AI 驱动的浏览器表单自动填写助手 (AI Form AutoFiller)

基于 **Chrome 浏览器扩展 (Manifest V3)** 与 **多模态大模型后端服务** 的网页表单智能自动填报系统。

旨在解决政务、文化、事业单位与统计系统中繁琐的人工重复填报痛点：用户手动登录目标系统后，插件通过多模态 AI 综合分析当前网页表单结构、Excel 台账数据或纸质台账截图，智能匹配字段并实现受控表单组件的原生自动注入与批量翻页填报。

---

## 核心功能特色

1. **Chrome 扩展 (Side Panel 侧边栏常驻)**：
   - 支持拖拽上传 Excel 台账（.xlsx / .xls / .csv），即时预览数据表头与数据行。
   - 支持直接 `Ctrl+V` / 剪贴板粘贴多张台账截图，由多模态大模型识别图片中的表格数据。
   - 多记录翻页导航（上一条/下一条），翻页时映射关系自动复用并替换数据值，无需重复分析。
   - 字段映射结果可视化核验，支持下拉选择候选元素或手动编辑 CSS 选择器。

2. **React / Vue 受控组件原生注入 (Content Script)**：
   - 穿透原型链通过原生属性描述符 `Object.getOwnPropertyDescriptor(prototype, 'value').set` 赋值。
   - 连续派发 `input`、`change`、`blur` 事件，确保各类前端框架内部数据绑定与验证逻辑正确响应。
   - 填报完成后提供高可见度琥珀色/黄色发光光晕及浮动微标，便于肉眼核验。

3. **动态网址表单提取与演练场**：
   - 网页内置在线实训沙箱，支持在地址栏输入任意系统或外部网页网址，实时提取并渲染其真实表单控件。

4. **独立控制中枢 (/admin)**：
   - 独立大模型路由配置（支持多端点与密钥切换、端点模型拉取、一键连通性探活）。
   - 任务填报审计日志，全量记录填报 URL、域名、数据来源及成功/失败字段明细。

---

## Docker 容器化部署

本项目已预置生产级多阶段容器化环境与 Windows 一键部署脚本：

- **Docker 镜像名与容器名**：`autorun`
- **宿主机对外映射端口**：`7891` (容器内端口 `3000`)
- **数据持久化目录**：
  - 本地部署：`D:\docker\autorun\data` 挂载至容器 `/app/data`
  - 远程部署：`/bak/docker/autorun/data` 挂载至容器 `/app/data`

### 1. 依赖锁文件说明（重要）
- 构建采用生产级多阶段方案，依赖按 `package-lock.json` 以 `npm ci --legacy-peer-deps` 精确安装，彻底规避在线解析冲突与网络中断。
- 若修改过 `package.json` 或删除过锁文件，必须先在终端执行以下命令重新生成锁文件（**必须带 `--legacy-peer-deps`**），再运行部署脚本：
  ```bash
  npm install --legacy-peer-deps --package-lock-only
  ```

### 2. 本地一键部署 (Windows)
双击运行根目录下的 `redeploy.bat`：
1. 自动检查 Docker Desktop 运行状态与 `package-lock.json`。
2. 本地构建生产镜像 `autorun:latest`。
3. 停止旧容器并自动挂载 `D:\docker\autorun\data` 目录。
4. 启动新容器并在后台执行 HTTP 200 健康检查。
5. 访问地址：`http://localhost:7891`

### 3. 远程服务器一键部署
双击运行根目录下的 `upload2remote.bat`：
1. 本地构建 `autorun` Docker 镜像并导出为 tar 压缩包。
2. 通过 SCP 上传至目标服务器 `172.29.173.42`（用户 `gpzx`）的 `/bak/tar/` 目录。
3. 远程自动通过 SSH 执行 `docker load` 导入镜像。
4. 预创建远程数据目录 `/bak/docker/autorun/data` 并设置完整权限。
5. 重启远程容器并接入 `mynet` 网络，对外暴露 `7891` 端口。
6. 访问地址：`http://172.29.173.42:7891`

---

## 本地开发调试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
# 业务前台与沙箱演练场: http://localhost:3000
# 独立管理后台: http://localhost:3000/admin (默认账号: admin / 密码: admin123)
```
