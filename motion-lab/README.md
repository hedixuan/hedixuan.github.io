# Motion Lab · 游戏 UI 动效实验室

在线体验：<https://hedixuan.github.io/motion-lab/>

这是 `game-dev-skills` 仓库中 `ui-motion-design` 的静态交互预览站点副本。此目录独立部署到 GitHub Pages，不改变个人主页根路径。

## 内容

- 22 套游戏 UI 动效模板。
- 左侧独立滚动模板库、关键词搜索、分类筛选。
- 中间舞台、时间轴和右侧参数面板。
- 按下/松开/点击、弹窗、转场、滚动列表、金币收获等真实交互预览。
- JSON、Markdown 和 Agent 复刻指令导出。

## 文件

- `index.html`：页面入口。
- `styles.css`：布局、主题及预览样式。
- `app.js`：交互、动画播放和参数导出。
- `presets.js` / `presets-expanded.js`：22 套模板定义。
- `motion-preset.schema.json`：参数导出结构约束。

## 源码与维护

权威源码仍在 [game-dev-skills](https://github.com/hedixuan/game-dev-skills/tree/main/skills/animation/ui-motion-design/playground)。

此目录是发布副本。更新时将上述运行文件从权威源码同步过来，并保留此目录的 Pages 路径。不要把本目录作为权威编辑源，以免与 Skill 仓库内容分叉。

## 本地预览

在本目录启动静态服务器：

```bash
python -m http.server 8000
```

访问 <http://localhost:8000/>。
