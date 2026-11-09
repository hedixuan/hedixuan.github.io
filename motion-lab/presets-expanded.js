import { presets as basePresets } from "./presets.js";

const extendedPresets = [
  {
    id: "button-down", title: "按下 · 受力确认", category: "interaction", categoryLabel: "BUTTON · PRESS",
    short: "按住时的受力反馈", icon: "↓", color: "#ffd17c", thumbBg: "rgba(255,190,97,.09)",
    description: "按下瞬间先给触觉确认，再以纵向压缩、轻微下沉和边缘收紧表现受力；按住时保持稳定，不持续抖动。",
    intent: "将用户的 pointer down / touch begin 转译为立即、明确、可保持的受力状态；输入命中和业务点击不受视觉缩放影响。",
    durationMs: 120, stages: ["输入命中", "快速压入", "按住保持"],
    parameters: [["按压缩放", "X 0.97 / Y 0.88"], ["下沉距离", "3 px"], ["压入时间", "90 ms"], ["保持状态", "不循环"], ["输入策略", "Pointer Down"]],
    interaction: { type: "pressable", target: "press-button", hint: "在按钮上按住鼠标或手指，感受受力；松开即可回弹。" },
    tracks: [
      {name:"按钮压入",target:"press-button",type:"primary",startMs:0,durationMs:100,easing:"cubic-bezier(.2,.85,.35,1)",frames:[{at:0,sx:1,sy:1,y:0},{at:.72,sx:.97,sy:.88,y:4},{at:1,sx:.97,sy:.88,y:4}]},
      {name:"边缘收紧",target:"press-rim",type:"secondary",startMs:0,durationMs:110,easing:"ease-out",frames:[{at:0,sx:1,sy:1,opacity:.4},{at:1,sx:.96,sy:.9,opacity:.9}]}
    ],
    scene: `<div class="scene demo-button-scene"><span class="scene-label">08 / PRESS · HOLD</span><div class="demo-button-shadow"></div><button class="demo-button" data-motion="press-button" data-action="pressable"><i class="demo-button-rim" data-motion="press-rim"></i><b>PRESS & HOLD</b><small>按住，不要松开</small></button><p class="demo-hint" data-demo-status>等待按下输入</p><span class="scene-subtitle">立即压入 · 保持受力 · 不重复播放</span></div>`
  },
  {
    id: "button-release", title: "松开 · 弹性回稳", category: "interaction", categoryLabel: "BUTTON · RELEASE",
    short: "松开后的释放与回弹", icon: "↑", color: "#a8e2d0", thumbBg: "rgba(113,217,193,.09)",
    description: "由压缩态释放，先越过静止尺寸，再快速回到基准；把弹性放在释放阶段，而不是按下阶段。",
    intent: "让用户感到按钮已释放并完成一次轻盈回弹；松手反馈短而清楚，不延迟后续输入。",
    durationMs: 300, stages: ["压缩态", "释放过冲", "回稳"],
    parameters: [["初始状态", "0.96 × 0.88"], ["释放过冲", "1.045 × 1.06"], ["回稳时间", "210 ms"], ["缓动", "Back Out"], ["输入策略", "Pointer Up"]],
    interaction: { type: "pressable", target: "release-button", hint: "按钮初始处于按下状态；按住后松开，可反复测试释放反馈。" },
    tracks: [
      {name:"释放回弹",target:"release-button",type:"primary",startMs:0,durationMs:290,easing:"cubic-bezier(.18,1.45,.42,1)",frames:[{at:0,sx:.96,sy:.88,y:4},{at:.28,sx:1.045,sy:1.06,y:-2},{at:.58,sx:.985,sy:.97,y:1},{at:1,sx:1,sy:1,y:0}]},
      {name:"释放光点",target:"release-spark",type:"fx",startMs:20,durationMs:220,easing:"ease-out",frames:[{at:0,sx:.2,sy:.2,opacity:0},{at:.35,sx:1,sy:1,opacity:.8},{at:1,sx:1.7,sy:1.7,opacity:0}]}
    ],
    scene: `<div class="scene demo-button-scene release-scene"><span class="scene-label">09 / RELEASE · SETTLE</span><div class="demo-button-shadow"></div><button class="demo-button is-held" data-motion="release-button" data-action="pressable"><i class="demo-button-rim"></i><b>RELEASE</b><small>松开，观察回弹</small><i class="release-spark" data-motion="release-spark">✦</i></button><p class="demo-hint" data-demo-status>当前：按下态</p><span class="scene-subtitle">压缩 → 释放过冲 → 回稳</span></div>`
  },
  {
    id: "button-click", title: "点击 · 确认脉冲", category: "feedback", categoryLabel: "BUTTON · CLICK",
    short: "点击瞬间的完整反馈", icon: "✦", color: "#ffcf88", thumbBg: "rgba(255,181,107,.1)",
    description: "一次点击由压入、释放、脉冲和轻微余震组成；点击涟漪只强调触点，不盖过按钮主体。",
    intent: "用完整的按下—松开—确认脉冲告诉玩家输入已被接收；连续点击时每次都从可预测状态开始。",
    durationMs: 420, stages: ["按下", "释放", "确认脉冲", "回稳"],
    parameters: [["动作总时长", "420 ms"], ["压入", "65 ms"], ["释放过冲", "1.06×"], ["涟漪半径", "72 px"], ["重复触发", "重置并重播"]],
    interaction: { type: "click-feedback", target: "click-button", hint: "点击舞台按钮，连续点击也会从稳定状态重新触发。" },
    tracks: [
      {name:"按钮主体",target:"click-button",type:"primary",startMs:0,durationMs:290,easing:"cubic-bezier(.2,.9,.3,1)",frames:[{at:0,sx:1,sy:1,y:0},{at:.2,sx:.94,sy:.9,y:3},{at:.58,sx:1.06,sy:1.07,y:-2},{at:1,sx:1,sy:1,y:0}]},
      {name:"点击涟漪",target:"click-ripple",type:"fx",startMs:75,durationMs:320,easing:"ease-out",frames:[{at:0,sx:.12,sy:.12,opacity:.8},{at:1,sx:2.3,sy:2.3,opacity:0}]},
      {name:"确认亮起",target:"click-check",type:"secondary",startMs:125,durationMs:210,easing:"ease-out",frames:[{at:0,sx:.4,sy:.4,opacity:0},{at:.5,sx:1.12,sy:1.12,opacity:1},{at:1,sx:1,sy:1,opacity:0}]}
    ],
    scene: `<div class="scene demo-button-scene click-scene"><span class="scene-label">10 / TAP · CONFIRM</span><div class="demo-button-shadow"></div><button class="demo-button" data-motion="click-button" data-action="click-feedback"><i class="demo-button-rim"></i><b>CLICK TO CONFIRM</b><small>点击触发完整反馈</small><i class="click-ripple" data-motion="click-ripple"></i><i class="click-check" data-motion="click-check">✓</i></button><p class="demo-hint" data-demo-status>READY · WAITING INPUT</p><span class="scene-subtitle">按下 · 松开 · 脉冲确认 · 回稳</span></div>`
  },
  {
    id: "popup-standard", title: "标准弹窗 · 聚焦入场", category: "transition", categoryLabel: "POPUP · ENTER",
    short: "遮罩与弹窗层级入场", icon: "▣", color: "#f4cf8b", thumbBg: "rgba(244,207,139,.09)",
    description: "遮罩先压低背景注意力，弹窗主体从略低位置弹入，标题和操作区错峰就位，建立清晰阅读顺序。",
    intent: "打开普通确认弹窗时先建立模态焦点，再让信息可读，最后开放主操作；避免所有内容一起淡入。",
    durationMs: 760, stages: ["背景压暗", "主体弹入", "信息就位", "操作可用"],
    parameters: [["遮罩时间", "220 ms"], ["主体入场", "420 ms"], ["主体起始", "Y +34 / Scale .86"], ["内容错峰", "90 ms"], ["交互解锁", "入场结束"]],
    tracks: [
      {name:"背景遮罩",target:"confirm-backdrop",type:"secondary",startMs:0,durationMs:220,easing:"ease-out",frames:[{at:0,opacity:0},{at:1,opacity:.72}]},
      {name:"弹窗主体",target:"confirm-modal",type:"primary",startMs:25,durationMs:440,easing:"cubic-bezier(.16,1,.3,1)",frames:[{at:0,y:34,sx:.86,sy:.86,opacity:0},{at:.72,y:-3,sx:1.035,sy:1.035,opacity:1},{at:1,y:0,sx:1,sy:1,opacity:1}]},
      {name:"标题与正文",target:"confirm-copy",type:"secondary",startMs:220,durationMs:260,easing:"ease-out",staggerMs:55,frames:[{at:0,y:12,opacity:0},{at:1,y:0,opacity:1}]},
      {name:"操作按钮",target:"confirm-actions",type:"fx",startMs:430,durationMs:240,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:10,sx:.92,sy:.92,opacity:0},{at:1,y:0,sx:1,sy:1,opacity:1}]}
    ],
    scene: `<div class="scene modal-demo-scene"><span class="scene-label">11 / MODAL · ENTER</span><div class="modal-demo-backdrop" data-motion="confirm-backdrop"></div><section class="modal-demo-card" data-motion="confirm-modal"><small class="modal-eyebrow" data-motion="confirm-copy">SYSTEM MESSAGE</small><h3 data-motion="confirm-copy">确认消耗道具？</h3><p data-motion="confirm-copy">本次操作将消耗 300 枚星辉<br>是否继续探索？</p><div class="modal-demo-actions" data-motion="confirm-actions"><button class="modal-cancel">稍后</button><button class="modal-ok">确认消耗</button></div></section><span class="scene-subtitle">遮罩聚焦 · 主体入场 · 信息接力 · 操作解锁</span></div>`
  },
  {
    id: "popup-dismiss", title: "弹窗 · 退出收束", category: "transition", categoryLabel: "POPUP · EXIT",
    short: "关闭弹窗与遮罩回收", icon: "×", color: "#c5b5ff", thumbBg: "rgba(155,140,255,.1)",
    description: "关闭不是简单瞬间隐藏：主体向上轻提并缩小淡出，遮罩同步回收；底层页面保持稳定，不跟着抖动。",
    intent: "关闭弹窗时保留空间方向感，快速还原背景交互；支持再次打开和连续开关。",
    durationMs: 340, stages: ["退出触发", "主体收束", "遮罩回收", "恢复交互"],
    parameters: [["主体退出", "260 ms"], ["缩小终值", "0.88×"], ["遮罩回收", "220 ms"], ["方向", "Y -18 px"], ["可逆性", "支持重新打开"]],
    interaction: { type: "popup-dismiss", hint: "点击右上角 × 关闭；点击底部“重新打开”可再次播放入场。" },
    tracks: [
      {name:"弹窗主体",target:"dismiss-modal",type:"primary",startMs:0,durationMs:280,easing:"cubic-bezier(.5,0,.8,.3)",frames:[{at:0,sx:1,sy:1,y:0,opacity:1},{at:.4,sx:.98,sy:.98,y:-4,opacity:1},{at:1,sx:.88,sy:.88,y:-18,opacity:0}]},
      {name:"背景遮罩",target:"dismiss-backdrop",type:"secondary",startMs:30,durationMs:220,easing:"ease-in",frames:[{at:0,opacity:.72},{at:1,opacity:0}]}
    ],
    scene: `<div class="scene dismiss-scene"><span class="scene-label">12 / MODAL · EXIT</span><div class="modal-demo-backdrop" data-motion="dismiss-backdrop"></div><section class="modal-demo-card dismiss-card" data-motion="dismiss-modal"><button class="modal-close" data-action="close-modal">×</button><small class="modal-eyebrow">PAUSE MENU</small><h3>冒险暂停</h3><p>休息一下，准备好再继续。</p><div class="modal-demo-actions"><button class="modal-ok">继续冒险</button></div></section><button class="reopen-modal" data-action="reopen-modal">重新打开弹窗</button><span class="scene-subtitle">主体收束 · 遮罩回收 · 背景保持稳定</span></div>`
  },
  {
    id: "page-slide", title: "页面转场 · 推入切换", category: "transition", categoryLabel: "PAGE · SLIDE",
    short: "新旧页面接力滑动", icon: "⇥", color: "#9fceff", thumbBg: "rgba(127,180,255,.1)",
    description: "旧页面带惯性退出，新页面从相反方向进入并略微超越终点；两个页面的运动有接力，不做同时等速平移。",
    intent: "在同层页面切换中明确方向关系与新旧页面交接，保持内容容器稳定，避免布局闪跳。",
    durationMs: 620, stages: ["旧页预备", "旧页滑出", "新页追入", "终点回稳"],
    parameters: [["旧页位移", "X -110 px"], ["新页起点", "X +160 px"], ["页面重叠", "120 ms"], ["新页过冲", "X -8 px"], ["时长", "620 ms"]],
    tracks: [
      {name:"旧页面",target:"page-old",type:"secondary",startMs:0,durationMs:360,easing:"cubic-bezier(.55,.05,.8,.4)",frames:[{at:0,x:0,opacity:1},{at:1,x:-120,opacity:.25}]},
      {name:"新页面",target:"page-new",type:"primary",startMs:140,durationMs:470,easing:"cubic-bezier(.16,1,.3,1)",frames:[{at:0,x:160,opacity:.2},{at:.82,x:-8,opacity:1},{at:1,x:0,opacity:1}]},
      {name:"页面标题",target:"page-title",type:"fx",startMs:360,durationMs:250,easing:"ease-out",frames:[{at:0,y:10,opacity:0},{at:1,y:0,opacity:1}]}
    ],
    scene: `<div class="scene page-transition-scene"><span class="scene-label">13 / PAGE · SLIDE</span><article class="demo-page page-old" data-motion="page-old"><small>WORLD MAP</small><h3>晨曦森林</h3><p>探索进度 68%</p><div class="demo-page-art">🌲 🌲 🌿</div></article><article class="demo-page page-new" data-motion="page-new"><small id="page-title" data-motion="page-title">NEW AREA</small><h3>星落海岸</h3><p>发现新的冒险区域</p><div class="demo-page-art">🌊 ✨ 🐚</div></article><span class="scene-subtitle">旧页退出 · 新页追入 · 反向交接 · 惯性回稳</span></div>`
  },
  {
    id: "page-wipe", title: "页面转场 · 遮罩揭幕", category: "transition", categoryLabel: "PAGE · WIPE",
    short: "遮罩裁切与内容揭示", icon: "◧", color: "#a8d9ff", thumbBg: "rgba(127,180,255,.1)",
    description: "由窄到宽的遮罩揭开新页面，背景亮度与前景内容错峰变化；揭示边缘带少量拖尾，不依赖大幅整体缩放。",
    intent: "使用形状/遮罩变化表现页面揭幕，让玩家感觉视野被打开，而不是两个页面互相淡入。",
    durationMs: 700, stages: ["遮罩起势", "内容展开", "边缘扫过", "揭示完成"],
    parameters: [["裁切方向", "左 → 右"], ["遮罩起始", "宽度 0%"], ["展开时间", "520 ms"], ["内容位移", "X +18 → 0"], ["边缘强调", "单次扫过"]],
    tracks: [
      {name:"页面遮罩",target:"wipe-mask",type:"primary",startMs:0,durationMs:540,easing:"cubic-bezier(.65,0,.25,1)",frames:[{at:0,clipPath:"inset(0 100% 0 0 round 12px)"},{at:1,clipPath:"inset(0 0 0 0 round 12px)"}]},
      {name:"页面内容",target:"wipe-content",type:"secondary",startMs:80,durationMs:450,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:18,opacity:.2},{at:1,x:0,opacity:1}]},
      {name:"揭示边缘",target:"wipe-edge",type:"fx",startMs:80,durationMs:510,easing:"ease-out",frames:[{at:0,x:-160,opacity:0},{at:.7,x:0,opacity:.8},{at:1,x:35,opacity:0}]}
    ],
    scene: `<div class="scene wipe-scene"><span class="scene-label">14 / PAGE · WIPE</span><div class="wipe-underlay"> <small>NEW CHAPTER</small><h3>雾海遗迹</h3><p>揭开未知区域</p><strong>✧  ✦  ✧</strong></div><div class="wipe-mask" data-motion="wipe-mask"><div class="wipe-content" data-motion="wipe-content"><small>CHAPTER 04</small><h3>雾海遗迹</h3><p>一段新的旅程即将开启</p><strong>✧  ✦  ✧</strong></div><i class="wipe-edge" data-motion="wipe-edge"></i></div><span class="scene-subtitle">遮罩揭幕 · 内容跟随 · 边缘强调</span></div>`
  },
  {
    id: "list-scroll", title: "滚动列表 · 惯性浏览", category: "interaction", categoryLabel: "LIST · SCROLL",
    short: "真实滚动与条目错峰", icon: "☷", color: "#8fe1c2", thumbBg: "rgba(113,217,193,.09)",
    description: "这里使用真实可滚动容器，支持鼠标滚轮、拖动滚动条和上下按钮；条目进入时错峰，列表内容不随外层舞台变形。",
    intent: "让玩家快速浏览长列表；滚动采用系统惯性，条目反馈轻量且不影响列表布局和点击命中。",
    durationMs: 540, stages: ["列表就位", "条目错峰", "滚动浏览", "停靠回稳"],
    parameters: [["列表高度", "210 px"], ["滚动步长", "132 px"], ["条目错峰", "55 ms"], ["惯性", "原生 Scroll"], ["条目反馈", "轻抬 + 淡入"]],
    interaction: { type: "list-scroll", hint: "使用滚轮、拖动滚动条，或点击 ↑ / ↓ 浏览列表。" },
    tracks: [
      {name:"列表条目",target:"list-item",type:"primary",startMs:0,durationMs:340,staggerMs:55,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:18,opacity:0,sx:.98,sy:.98},{at:1,y:0,opacity:1,sx:1,sy:1}]},
      {name:"列表标题",target:"list-title",type:"secondary",startMs:0,durationMs:240,easing:"ease-out",frames:[{at:0,y:8,opacity:0},{at:1,y:0,opacity:1}]}
    ],
    scene: `<div class="scene list-demo-scene"><span class="scene-label">15 / LIST · SCROLL</span><div class="list-demo-head"><div><small>QUEST LOG</small><b data-motion="list-title">探索任务</b></div><div class="list-scroll-actions"><button data-action="scroll-up" aria-label="向上滚动">↑</button><button data-action="scroll-down" aria-label="向下滚动">↓</button></div></div><div class="list-viewport" data-list-viewport><div class="list-content"><article class="list-row" data-motion="list-item"><span>🌲</span><div><b>寻找晨露草</b><small>在森林收集 3 株</small></div><em>2 / 3</em></article><article class="list-row" data-motion="list-item"><span>💎</span><div><b>矿洞探险</b><small>发现稀有矿石</small></div><em>0 / 1</em></article><article class="list-row" data-motion="list-item"><span>🧭</span><div><b>旧港的线索</b><small>与港口商人交谈</small></div><em>1 / 2</em></article><article class="list-row" data-motion="list-item"><span>🪙</span><div><b>收集遗落金币</b><small>累计获得 500 金币</small></div><em>320 / 500</em></article><article class="list-row" data-motion="list-item"><span>🗝️</span><div><b>开启古老宝箱</b><small>找到沉睡的钥匙</small></div><em>未完成</em></article><article class="list-row" data-motion="list-item"><span>🦋</span><div><b>追逐月光蝶</b><small>夜晚在海岸寻找</small></div><em>0 / 5</em></article></div></div><p class="demo-hint">真实滚动容器 · 内容不缩放 · 可操作条目</p><span class="scene-subtitle">滚轮 / 滑动 / 按钮 · 惯性滚动 · 条目错峰</span></div>`
  },
  {
    id: "coin-harvest", title: "点击收获 · 金币散射归仓", category: "reward", categoryLabel: "REWARD · COIN HARVEST",
    short: "多金币散开后曲线飞入 HUD", icon: "🪙", color: "#f6cc6c", thumbBg: "rgba(246,204,108,.09)",
    description: "点击奖励堆后，多枚金币先从中心散开并短暂停留，再按错峰沿二阶贝塞尔弧线飞入 HUD；每枚到达才增加数值。",
    intent: "将奖励从来源释放、散射成可读的金币群，再逐枚吸附到 HUD；让飞行轨迹、到账反馈和数值变化形成同一条因果链。",
    durationMs: 1500, stages: ["点击触发", "多枚金币散射", "错峰等待", "曲线飞入 HUD", "逐枚到账", "最后一枚完成回调"],
    parameters: [["默认散射数量", "8 枚"], ["count 映射", "[0, 1, 4, 6, 8, 10, 12]"], ["散射半径", "50 px"], ["随机范围", "±40 px（预览采用确定性种子）"], ["散射时长", "100 ms"], ["展示等待", "100–300 ms"], ["飞行等待", "300–500 ms"], ["飞行时长", "300 ms"], ["弧线高度", "200 px"], ["路径", "直线 / 二阶 Bezier"], ["动画类型", "标准 / 放大收尾"], ["每枚到账", "+25"], ["完成事件", "最后一枚到达后触发"]],
    interaction: { type: "coin-harvest", hint: "点击金币堆，观察多枚金币先散开，再错峰飞入右上角 HUD。金额随每枚金币到达递增。" },
    sequence: {
      model: "fan-out-then-staggered-bezier-flight",
      source: "coin-source",
      destination: "coin-hud",
      countIndex: 4,
      countMapping: [0, 1, 4, 6, 8, 10, 12],
      spawnCount: 8,
      animationType: "defult",
      scatter: { radius: 50, randomScope: 40, durationMs: 100, scaleFrom: 0.3, scalePeak: 1.69, settleScale: 1.3, positionSpace: "shared-ui-parent" },
      wait: { showDelayRangeMs: [100, 300], flyDelayBaseMs: 200, flyDelayRangeMs: [100, 300] },
      flight: { pathType: "quadratic-bezier", durationMs: 300, arcHeight: 200, controlPoint: "midpoint + perpendicular * arcHeight", scaleTo: 1, endOvershoot: [1.1, 0.5], opacityTo: 0, lineType: "bezier" },
      arrival: { valuePerItem: 25, updateTiming: "on-each-item-arrival", completion: "after-last-item-arrival", callbacks: ["onProgress", "onComplete", "onAniEnd"] },
      lifecycle: { cancelPrevious: true, destroyOrRecycleOnArrival: true, guardAgainstDestroyedTarget: true, reuseToken: "required-for-pooled-nodes" },
      sourceApiConcepts: { inputNames: ["zeroPoint", "endPoint", "item", "count", "parent", "r", "endT", "randomScope", "lineType", "animType", "onProgress", "onComplete", "sound", "size", "onAniEnd"], mappingNote: "这些名称用于理解用户提供的 Cocos 旧项目函数参数；实际实现需按目标项目版本重新映射，不复制 API。" }
    },
    tracks: [
      {name:"奖励堆按压",target:"coin-source",type:"primary",startMs:0,durationMs:180,easing:"cubic-bezier(.2,.9,.3,1)",frames:[{at:0,sx:1,sy:1},{at:.35,sx:.9,sy:.88,y:3},{at:1,sx:1.06,sy:1.06,y:-2}]},
      {name:"金币散射群",target:"coin-fx-anchor",type:"primary",startMs:100,durationMs:230,easing:"cubic-bezier(.15,.85,.3,1)",frames:[{at:0,sx:.3,sy:.3,opacity:0},{at:.42,sx:1.3,sy:1.3,opacity:1},{at:1,sx:1,sy:1,opacity:0}]},
      {name:"HUD 接收",target:"coin-hud",type:"secondary",startMs:900,durationMs:240,easing:"cubic-bezier(.2,1,.3,1)",frames:[{at:0,sx:1,sy:1},{at:.35,sx:1.18,sy:1.18},{at:1,sx:1,sy:1}]},
      {name:"到账数字",target:"coin-total",type:"fx",startMs:900,durationMs:300,easing:"ease-out",frames:[{at:0,y:5,sx:.9,sy:.9},{at:.4,y:-3,sx:1.12,sy:1.12},{at:1,y:0,sx:1,sy:1}]}
    ],
    scene: `<div class="scene harvest-scene"><span class="scene-label">16 / COIN · FAN OUT → HOME</span><div class="harvest-hud" data-coin-hud data-motion="coin-hud"><span>🪙</span><b data-coin-total data-motion="coin-total">8,420</b></div><div class="harvest-toolbar"><label>金币数量 <select data-coin-count><option value="1">1 枚</option><option value="4">4 枚</option><option value="6">6 枚</option><option value="8" selected>8 枚</option><option value="10">10 枚</option><option value="12">12 枚</option></select></label><label>散射半径 <input type="range" min="25" max="90" value="50" data-coin-radius><output data-radius-value>50</output></label><label>随机范围 <input type="range" min="0" max="80" value="40" data-coin-random><output data-random-value>40</output></label><label>弧线高度 <input type="range" min="50" max="240" step="10" value="200" data-coin-arc><output data-arc-value>200</output></label><label>飞行路径 <select data-coin-line><option value="bezier" selected>贝塞尔</option><option value="beeline">直线</option></select></label><label>动画类型 <select data-coin-anim><option value="defult" selected>标准</option><option value="scalebigger">放大收尾</option></select></label><label>飞行时长 <input type="range" min="180" max="700" step="20" value="300" data-coin-flight><output data-flight-value>300</output> ms</label></div><div class="harvest-source-glow"></div><button class="harvest-source" data-action="collect-coins" data-coin-origin data-motion="coin-source"><span class="harvest-coins">🪙</span><b>收获金币</b><small>点击开始 · 每枚 +25</small></button><span class="harvest-fx-anchor" data-motion="coin-fx-anchor"></span><p class="harvest-status" data-harvest-status>点击金币堆开始收获</p><span class="scene-subtitle">多枚散射 · 错峰等待 · 二阶贝塞尔归仓 · 逐枚到账</span></div>`
  },
  {
    id: "coin-tap", title: "点击金币 · 单次拾取", category: "reward", categoryLabel: "REWARD · PICKUP",
    short: "单枚金币拾取与数值跳动", icon: "✧", color: "#f3ca70", thumbBg: "rgba(246,204,108,.09)",
    description: "金币被点中时先短促压缩，再向上跃起并旋转消失；HUD 同步弹跳，数字只在拾取完成时增加。",
    intent: "把点击命中、金币离场和资源到账绑定为一次清晰事件；避免动画开始就提前修改数值。",
    durationMs: 460, stages: ["触点确认", "金币跃起", "金币回收", "数值到账"],
    parameters: [["拾取时长", "380 ms"], ["跃起高度", "42 px"], ["旋转", "180°"], ["数值提交", "动画完成时"], ["奖励值", "+100"]],
    interaction: { type: "coin-tap", hint: "点击地面金币可拾取；每次成功拾取后 HUD 增加 100。" },
    sequence: { model:"tap-then-pickup", source:"pickup-coin", destination:"pickup-hud", commit:"on-animation-complete", value:100, repeat:"each-valid-tap", feedback:["coin-hop","coin-rotate","hud-pulse","number-increment"] },
    tracks: [
      {name:"金币拾取",target:"pickup-coin",type:"primary",startMs:0,durationMs:370,easing:"cubic-bezier(.2,.8,.3,1)",frames:[{at:0,sx:1,sy:1,y:0,rotate:0},{at:.18,sx:.82,sy:.9,y:3,rotate:-8},{at:.68,sx:1.08,sy:1.08,y:-40,rotate:145,opacity:1},{at:1,sx:.3,sy:.3,y:-62,rotate:180,opacity:0}]},
      {name:"HUD 数值反馈",target:"pickup-hud",type:"secondary",startMs:310,durationMs:230,easing:"cubic-bezier(.2,1,.3,1)",frames:[{at:0,sx:1,sy:1},{at:.42,sx:1.18,sy:1.18},{at:1,sx:1,sy:1}]},
      {name:"拾取光圈",target:"pickup-ring",type:"fx",startMs:30,durationMs:320,easing:"ease-out",frames:[{at:0,sx:.25,sy:.25,opacity:.9},{at:1,sx:1.8,sy:1.8,opacity:0}]}
    ],
    scene: `<div class="scene pickup-scene"><span class="scene-label">17 / PICKUP · TAP</span><div class="pickup-hud" data-motion="pickup-hud" data-pickup-hud><span>🪙</span><b data-pickup-total>2,350</b></div><button class="pickup-coin" data-action="pickup-coin" data-motion="pickup-coin">🪙</button><i class="pickup-ring" data-motion="pickup-ring"></i><p class="demo-hint" data-pickup-status>点击金币拾取 +100</p><span class="scene-subtitle">命中反馈 · 跃起回收 · 完成后到账</span></div>`
  },
  {
    id: "tab-switch", title: "页签切换 · 指示器滑动", category: "interaction", categoryLabel: "TAB · SWITCH",
    short: "页签状态与指示器滑动", icon: "↔", color: "#b7c8ff", thumbBg: "rgba(155,170,255,.1)",
    description: "指示器沿轨道滑向新页签，旧内容先退后进；标题、指示器与内容使用不同节奏，避免整屏闪烁。",
    intent: "反馈当前选择和内容归属，保持选中态与内容状态一致；快速切换时只保留最后一次目标。",
    durationMs: 360, stages: ["选中触发", "指示器移动", "内容切换", "状态稳定"],
    parameters: [["指示器时长", "280 ms"], ["内容过渡", "160 ms"], ["切换策略", "最后输入优先"], ["方向", "跟随目标页签"]],
    interaction: { type: "tabs", hint: "点击“背包 / 角色 / 图鉴”切换页签，观察指示器和内容跟随。" },
    tracks: [
      {name:"页签指示器",target:"tab-indicator",type:"primary",startMs:0,durationMs:280,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0},{at:1,x:0}]},
      {name:"内容面板",target:"tab-content",type:"secondary",startMs:40,durationMs:240,easing:"ease-out",frames:[{at:0,y:7,opacity:.3},{at:.55,y:0,opacity:1},{at:1,y:0,opacity:1}]}
    ],
    scene: `<div class="scene tab-scene"><span class="scene-label">18 / TAB · SWITCH</span><div class="tab-bar"><button class="tab-option active" data-tab="bag">背包</button><button class="tab-option" data-tab="hero">角色</button><button class="tab-option" data-tab="codex">图鉴</button><i class="tab-indicator" data-motion="tab-indicator"></i></div><div class="tab-content" data-tab-content data-motion="tab-content"><div class="tab-panel active" data-panel="bag"><span>🎒</span><b>冒险背包</b><small>当前拥有 24 件物品</small></div><div class="tab-panel" data-panel="hero"><span>🧙</span><b>旅者档案</b><small>等级 09 · 战力 1280</small></div><div class="tab-panel" data-panel="codex"><span>📖</span><b>探索图鉴</b><small>已发现 36 / 80 项</small></div></div><span class="scene-subtitle">指示器跟随 · 内容轻接力 · 状态同步</span></div>`
  },
  {
    id: "panel-expand", title: "折叠面板 · 展开收起", category: "interaction", categoryLabel: "PANEL · EXPAND",
    short: "面板高度与内容揭示", icon: "⌄", color: "#91e6c1", thumbBg: "rgba(113,217,193,.09)",
    description: "展开时先改变容器高度，再让内部内容逐步显现；收起反向执行，避免内容突然消失或容器跳变。",
    intent: "在任务详情、设置项和背包分类中形成稳定的展开/收起交互，内容、箭头和容器终态一致。",
    durationMs: 360, stages: ["点击触发", "容器展开", "内容揭示", "箭头归位"],
    parameters: [["展开时长", "320 ms"], ["内容延迟", "70 ms"], ["高度", "内容自适应"], ["反向播放", "支持"], ["布局", "动画结束后恢复 Auto"]],
    interaction: { type: "accordion", hint: "点击“森林探索详情”标题，反复展开与收起面板。" },
    tracks: [
      {name:"面板容器",target:"accordion-card",type:"primary",startMs:0,durationMs:320,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,sy:.72,opacity:.7},{at:1,sy:1,opacity:1}]},
      {name:"详情内容",target:"accordion-body",type:"secondary",startMs:70,durationMs:220,easing:"ease-out",frames:[{at:0,y:-7,opacity:0},{at:1,y:0,opacity:1}]},
      {name:"展开箭头",target:"accordion-arrow",type:"fx",startMs:0,durationMs:260,easing:"ease-out",frames:[{at:0,rotate:0},{at:1,rotate:180}]}
    ],
    scene: `<div class="scene accordion-scene"><span class="scene-label">19 / PANEL · EXPAND</span><section class="accordion-card" data-motion="accordion-card"><button class="accordion-head" data-action="toggle-accordion"><span>🌲</span><b>森林探索详情</b><i data-motion="accordion-arrow">⌄</i></button><div class="accordion-body" data-accordion-body data-motion="accordion-body"><p>在晨曦森林中找到失落的树种，帮助守林人恢复林地。</p><div><span>当前进度</span><b>2 / 3</b></div><div class="accordion-progress"><i></i></div></div></section><span class="demo-hint" data-accordion-status>点击标题查看详情</span><span class="scene-subtitle">容器伸展 · 内容跟随 · 状态可逆</span></div>`
  },
  {
    id: "toast-notify", title: "轻提示 · Toast 弹出", category: "system", categoryLabel: "SYSTEM · TOAST",
    short: "轻提示出现与自动消退", icon: "▰", color: "#9fd6ff", thumbBg: "rgba(127,180,255,.1)",
    description: "提示先从轻微位移与透明度进入，图标和文字接力出现，短暂停留后整体轻退；不抢夺模态焦点。",
    intent: "反馈轻量、非阻断事件，如保存成功、金币到账和背包已满；提示不阻断玩家继续操作。",
    durationMs: 1750, stages: ["提示进入", "信息展示", "短暂停留", "自动退场"],
    parameters: [["入场", "260 ms"], ["停留", "1050 ms"], ["退场", "220 ms"], ["交互", "非阻断"], ["队列策略", "相同提示合并"]],
    tracks: [
      {name:"提示主体",target:"toast-body",type:"primary",startMs:0,durationMs:260,easing:"cubic-bezier(.16,1,.3,1)",frames:[{at:0,y:24,sx:.96,sy:.96,opacity:0},{at:1,y:0,sx:1,sy:1,opacity:1}]},
      {name:"图标确认",target:"toast-icon",type:"secondary",startMs:100,durationMs:220,easing:"ease-out",frames:[{at:0,sx:.5,sy:.5,rotate:-25,opacity:0},{at:.55,sx:1.15,sy:1.15,rotate:8,opacity:1},{at:1,sx:1,sy:1,rotate:0,opacity:1}]},
      {name:"自动退场",target:"toast-body",type:"fx",startMs:1320,durationMs:220,easing:"ease-in",frames:[{at:0,y:0,opacity:1},{at:1,y:-15,opacity:0}]}
    ],
    scene: `<div class="scene toast-scene"><span class="scene-label">20 / TOAST · NOTIFICATION</span><div class="toast-demo" data-motion="toast-body"><span data-motion="toast-icon">✓</span><div><b>保存成功</b><small>游戏进度已安全保存</small></div></div><p class="demo-hint">轻量提示 · 不锁定底层交互</p><span class="scene-subtitle">入场 · 短暂停留 · 自动消退</span></div>`
  },
  {
    id: "number-countup", title: "数值变化 · 滚动计数", category: "system", categoryLabel: "HUD · NUMBER",
    short: "数字递增与 HUD 反馈", icon: "#", color: "#ffd17c", thumbBg: "rgba(255,190,97,.09)",
    description: "数字使用缓出曲线递增，接近终值时减速；HUD 容器在关键节点轻微过冲，避免数字跳变或无限滚动。",
    intent: "让资源变化被玩家感知，同时保持数值与真实业务提交一致；动画只负责视觉插值。",
    durationMs: 920, stages: ["旧值确认", "数字递增", "接近终值减速", "HUD 回稳"],
    parameters: [["起始值", "1,280"], ["目标值", "1,680"], ["递增时长", "820 ms"], ["曲线", "Ease Out Cubic"], ["终值策略", "业务值为准"]],
    interaction: { type: "counter", hint: "重播或点击数字，可再次从 1,280 计数到 1,680。" },
    sequence: { model:"numeric-interpolation", from:1280, to:1680, durationMs:820, easing:"ease-out-cubic", update:"requestAnimationFrame", finalValueSource:"authoritative-business-state" },
    tracks: [
      {name:"HUD 容器",target:"number-hud",type:"primary",startMs:0,durationMs:920,easing:"cubic-bezier(.2,1,.3,1)",frames:[{at:0,sx:1,sy:1},{at:.12,sx:1.12,sy:1.12},{at:.35,sx:.98,sy:.98},{at:1,sx:1,sy:1}]},
      {name:"数字强调",target:"number-value",type:"secondary",startMs:0,durationMs:920,easing:"ease-out",frames:[{at:0,y:4,opacity:.7},{at:.2,y:-3,opacity:1},{at:1,y:0,opacity:1}]}
    ],
    scene: `<div class="scene number-scene"><span class="scene-label">21 / HUD · COUNT UP</span><button class="number-hud" data-action="counter" data-motion="number-hud"><span>⭐</span><b data-counter-value data-from="1280" data-to="1680" data-motion="number-value">1,280</b></button><p class="demo-hint" data-counter-status>点击数值或重播动效</p><span class="scene-subtitle">数值缓出 · HUD 过冲 · 终值锁定</span></div>`
  },
  {
    id: "grid-enter", title: "网格列表 · 分组入场", category: "transition", categoryLabel: "COLLECTION · STAGGER",
    short: "卡片分组错峰与接力", icon: "▦", color: "#b8a7ff", thumbBg: "rgba(155,140,255,.1)",
    description: "网格不是所有卡片同时淡入，而是按行列分组、从视觉起点向外错峰；主体先到，稀有标记随后补充。",
    intent: "让大量内容有阅读秩序，避免批量刷新时的机械齐步；保持网格布局不受动画 transform 影响。",
    durationMs: 780, stages: ["容器就位", "首行进入", "后续行接力", "稀有标记强调"],
    parameters: [["条目数量", "6"], ["行列间隔", "65 ms"], ["入场位移", "Y +18 px"], ["过冲", "1.04×"], ["布局节点", "与视觉节点分离"]],
    tracks: [
      {name:"卡片分组",target:"grid-card",type:"primary",startMs:0,durationMs:380,staggerMs:65,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:18,sx:.92,sy:.92,opacity:0},{at:.72,y:-2,sx:1.035,sy:1.035,opacity:1},{at:1,y:0,sx:1,sy:1,opacity:1}]},
      {name:"稀有标记",target:"grid-rare",type:"fx",startMs:410,durationMs:260,staggerMs:40,easing:"ease-out",frames:[{at:0,sx:.5,sy:.5,opacity:0},{at:.45,sx:1.2,sy:1.2,opacity:1},{at:1,sx:1,sy:1,opacity:1}]}
    ],
    scene: `<div class="scene grid-enter-scene"><span class="scene-label">22 / GRID · STAGGER</span><div class="demo-grid"><article data-motion="grid-card"><span>🧪</span><b>魔法药剂</b><small>× 12</small></article><article data-motion="grid-card"><span>💎</span><b>星辉宝石</b><small>× 3 <i data-motion="grid-rare">RARE</i></small></article><article data-motion="grid-card"><span>🗝️</span><b>古老钥匙</b><small>× 1</small></article><article data-motion="grid-card"><span>🍄</span><b>月光蘑菇</b><small>× 8</small></article><article data-motion="grid-card"><span>🪶</span><b>风羽</b><small>× 4</small></article><article data-motion="grid-card"><span>📜</span><b>残卷</b><small>× 2</small></article></div><span class="scene-subtitle">按组错峰 · 主体入场 · 稀有标记接力</span></div>`
  }
];

export const presets = [...basePresets, ...extendedPresets];
