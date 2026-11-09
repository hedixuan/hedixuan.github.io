export const presets = [
  {
    id: "button-impulse", title: "脉冲确认", category: "feedback", categoryLabel: "INPUT FEEDBACK",
    short: "按钮按压反馈", icon: "↯", color: "#ffd17c", thumbBg: "rgba(255,190,97,.09)",
    description: "以预压、释放过冲和快速回稳表达受力，让一次点击既明确又有手感。",
    intent: "用户按下按钮时立即获得确认；释放时表现短促能量回弹，不拖慢连续操作。",
    durationMs: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    stages: ["预压", "释放过冲", "回稳"],
    parameters: [
      ["按压缩放", "0.94×"], ["释放过冲", "1.055×"], ["按压时长", "72 ms"], ["回稳时长", "180 ms"], ["支点", "视觉中心"], ["触发策略", "从当前态重播"]
    ],
    tracks: [
      { name: "按钮主体", type: "primary", startMs: 0, durationMs: 310, easing: "cubic-bezier(.2,.8,.2,1)", frames: [
        {at:0,sx:1,sy:1},{at:.22,sx:.94,sy:.91,y:3},{at:.55,sx:1.055,sy:1.065,y:-3},{at:1,sx:1,sy:1}
      ]},
      { name: "高光扫过", type: "fx", startMs: 70, durationMs: 360, easing: "ease-out", frames: [
        {at:0,x:-45,opacity:0},{at:.35,x:0,opacity:.75},{at:1,x:90,opacity:0}
      ]},
      { name: "外圈呼吸", type: "secondary", startMs: 110, durationMs: 410, easing: "ease-out", frames: [
        {at:0,sx:.88,sy:.88,opacity:0},{at:.25,sx:1.08,sy:1.08,opacity:.5},{at:1,sx:1.28,sy:1.28,opacity:0}
      ]}
    ],
    scene: `<div class="scene button-scene">
      <span class="scene-label">01 / TACTILE FEEDBACK</span>
      <div class="button-shadow"></div>
      <button class="game-button" type="button" data-motion="button">
        <span class="button-orbit" data-motion="orbit"></span><span class="button-shine" data-motion="shine"></span>
        <span class="button-label">CLAIM REWARD</span><span class="button-sub">获得奖励</span>
      </button>
      <span class="button-caption">TAP · RELEASE · SETTLE</span>
      <span class="scene-subtitle">快速反馈 · 受力感 · 克制的回弹</span>
    </div>`
  },
  {
    id: "popup-reveal", title: "圣辉揭示", category: "transition", categoryLabel: "REWARD REVEAL",
    short: "奖励弹窗揭示", icon: "✧", color: "#f4cf8b", thumbBg: "rgba(244,207,139,.09)",
    description: "遮罩、主体、标题、奖励组和主操作分轨接力，先建立焦点，再安排阅读顺序。",
    intent: "让用户第一眼看到奖励主体，随后依序理解奖励内容，最后注意到确认操作。",
    durationMs: 1380, easing: "cubic-bezier(.16,1,.3,1)",
    stages: ["背景聚焦", "主体入场", "内容错峰", "主操作强调"],
    parameters: [
      ["主体入场", "420 ms"], ["内容错峰", "72 ms"], ["遮罩终值", "56%"], ["主体过冲", "1.045×"], ["焦点顺序", "标题 → 奖励 → 按钮"], ["操作解锁", "奖励主体稳定后"]
    ],
    tracks: [
      {name:"背景遮罩",target:"backdrop",type:"secondary",startMs:0,durationMs:280,easing:"ease-out",frames:[{at:0,opacity:0},{at:1,opacity:1}]},
      {name:"弹窗主体",target:"modal",type:"primary",startMs:50,durationMs:510,easing:"cubic-bezier(.16,1,.3,1)",frames:[{at:0,sy:.72,sx:.88,y:34,opacity:0},{at:.62,sy:1.045,sx:1.025,y:-4,opacity:1},{at:1,sy:1,sx:1,y:0,opacity:1}]},
      {name:"标题揭示",target:"title",type:"secondary",startMs:380,durationMs:300,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:12,opacity:0},{at:1,y:0,opacity:1}]},
      {name:"奖励组错峰",target:"reward",type:"secondary",startMs:550,durationMs:620,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:22,sx:.8,sy:.8,opacity:0},{at:.55,y:-3,sx:1.045,sy:1.045,opacity:1},{at:1,y:0,sx:1,sy:1,opacity:1}]},
      {name:"确认按钮",target:"claim",type:"fx",startMs:1040,durationMs:340,easing:"ease-out",frames:[{at:0,sy:.82,sx:.9,opacity:0},{at:.55,sy:1.06,sx:1.04,opacity:1},{at:1,sy:1,sx:1,opacity:1}]},
      {name:"装饰星点",target:"spark",type:"fx",startMs:650,durationMs:650,easing:"ease-out",frames:[{at:0,sy:.2,sx:.2,opacity:0},{at:.4,sy:1.2,sx:1.2,opacity:.9},{at:1,sy:.8,sx:.8,opacity:0}]}
    ],
    scene: `<div class="scene popup-scene">
      <span class="scene-label">02 / LAYERED REVEAL</span>
      <div class="modal-backdrop" data-motion="backdrop"></div>
      <div class="reward-modal" data-motion="modal">
        <div class="modal-rim"></div>
        <div class="modal-kicker" data-motion="title">RARE DROP · REWARD</div>
        <div class="modal-title" data-motion="title">宝藏已发现</div>
        <div class="modal-desc">探索奖励已放入你的背包</div>
        <div class="reward-row">
          <div class="reward-chip" data-motion="reward"><span class="reward-icon">💎</span><small>× 120</small></div>
          <div class="reward-chip" data-motion="reward"><span class="reward-icon">🪙</span><small>× 680</small></div>
          <div class="reward-chip" data-motion="reward"><span class="reward-icon">🎁</span><small>× 1</small></div>
        </div>
        <button class="claim-mini" data-motion="claim">确 认</button>
      </div>
      <span class="spark" style="left:23%;top:28%" data-motion="spark">✦</span><span class="spark" style="right:21%;bottom:25%" data-motion="spark">✧</span>
      <span class="scene-subtitle">遮罩聚焦 · 内容接力 · 最后交出操作焦点</span>
    </div>`
  },
  {
    id: "currency-fly", title: "金币归仓", category: "system", categoryLabel: "RESOURCE FEEDBACK",
    short: "奖励飞入 HUD", icon: "◈", color: "#f6cc6c", thumbBg: "rgba(246,204,108,.09)",
    description: "资源从来源卡片释放，沿弧线飞向 HUD；飞行方向驱动拖尾，抵达事件触发数值反馈。",
    intent: "清楚表达资源来源、运动路径和到账目标，让视觉表现与真实数据提交保持一致。",
    durationMs: 1120, easing: "cubic-bezier(.22,.72,.2,1)",
    stages: ["来源确认", "释放", "弧线飞行", "吸附到账"],
    parameters: [
      ["飞行时长", "720 ms"], ["路径", "二阶弧线"], ["方向旋转", "跟随切线"], ["拖尾寿命", "180 ms"], ["目标策略", "释放时快照"], ["到账事件", "到达后提交"]
    ],
    tracks: [
      {name:"来源奖励",target:"source",type:"primary",startMs:0,durationMs:180,easing:"ease-out",frames:[{at:0,sx:1,sy:1},{at:.55,sx:1.08,sy:1.08},{at:1,sx:.94,sy:.94,opacity:.5}]},
      {name:"金币飞行",target:"coin",type:"primary",startMs:160,durationMs:720,easing:"cubic-bezier(.34,.02,.72,.98)",frames:[{at:0,x:0,y:0,sx:1,sy:1,rotate:0,opacity:1},{at:.35,x:132,y:-75,sx:1.12,sy:.9,rotate:130,opacity:1},{at:.78,x:330,y:-118,sx:1,sy:1,rotate:300,opacity:1},{at:1,x:405,y:-100,sx:.25,sy:.25,rotate:420,opacity:0}]},
      {name:"运动拖尾",target:"trail",type:"fx",startMs:210,durationMs:620,easing:"ease-out",frames:[{at:0,x:0,y:0,sx:.15,opacity:0},{at:.35,x:130,y:-65,sx:1.2,opacity:.85},{at:1,x:390,y:-100,sx:.15,opacity:0}]},
      {name:"HUD 接收",target:"hud",type:"secondary",startMs:850,durationMs:270,easing:"cubic-bezier(.2,.9,.3,1)",frames:[{at:0,sx:1,sy:1},{at:.42,sx:1.22,sy:1.22},{at:1,sx:1,sy:1}]},
      {name:"到账波纹",target:"ring",type:"fx",startMs:860,durationMs:250,easing:"ease-out",frames:[{at:0,sx:.3,sy:.3,opacity:0},{at:.2,sx:.75,sy:.75,opacity:.9},{at:1,sx:1.8,sy:1.8,opacity:0}]}
    ],
    scene: `<div class="scene fly-scene">
      <span class="scene-label">03 / CAUSE & DESTINATION</span>
      <div class="reward-source" data-motion="source"><span class="source-icon">🪙</span><span class="source-label">QUEST REWARD</span></div>
      <span class="source-caption">REWARD RECEIVED</span>
      <div class="hud-counter" data-motion="hud"><span class="hud-coin">¢</span><span class="hud-value">8,420</span></div>
      <div class="fly-trail" data-motion="trail"></div><span class="fly-coin" data-motion="coin">🪙</span>
      <div class="arrival-ring" data-motion="ring"></div>
      <span class="scene-subtitle">释放 → 轨迹 → 吸附 → 数值确认</span>
    </div>`
  },
  {
    id: "merge-hint", title: "双子共鸣", category: "feedback", categoryLabel: "IDLE GUIDANCE",
    short: "可合成待机提示", icon: "⟡", color: "#91e6c1", thumbBg: "rgba(113,217,193,.09)",
    description: "两个可合成元素先产生微弱预备，再相互吸引并轻轻回弹；提示有节奏，不持续骚扰。",
    intent: "玩家长时间未操作时，柔和提醒两个元素可以合成，并让合成关系一眼可见。",
    durationMs: 1480, loopPauseMs: 1350, easing: "cubic-bezier(.2,.8,.2,1)",
    stages: ["静止识别", "预备吸引", "接近回弹", "提示回稳"],
    parameters: [
      ["元素吸引", "18 px"], ["预备停顿", "160 ms"], ["单次周期", "1.48 s"], ["回弹幅度", "1.06×"], ["提示频率", "间歇触发"], ["业务状态", "只读展示"]
    ],
    tracks: [
      {name:"左侧元素",target:"left",type:"primary",startMs:0,durationMs:1040,easing:"cubic-bezier(.2,.8,.2,1)",iterations:1,frames:[{at:0,x:0,y:0,rotate:0,sx:1,sy:1},{at:.18,x:-3,y:2,rotate:-4,sx:1.04,sy:.96},{at:.58,x:18,y:-2,rotate:7,sx:1.06,sy:.94},{at:.82,x:21,y:0,rotate:2,sx:.98,sy:1.04},{at:1,x:0,y:0,rotate:0,sx:1,sy:1}]},
      {name:"右侧元素",target:"right",type:"primary",startMs:0,durationMs:1040,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0,y:0,rotate:0,sx:1,sy:1},{at:.18,x:3,y:2,rotate:4,sx:1.04,sy:.96},{at:.58,x:-18,y:-2,rotate:-7,sx:1.06,sy:.94},{at:.82,x:-21,y:0,rotate:-2,sx:.98,sy:1.04},{at:1,x:0,y:0,rotate:0,sx:1,sy:1}]},
      {name:"共鸣光环",target:"pulse",type:"fx",startMs:300,durationMs:720,easing:"ease-out",frames:[{at:0,sx:.5,sy:.5,opacity:0},{at:.25,sx:1,sy:1,opacity:.55},{at:1,sx:1.55,sy:1.55,opacity:0}]},
      {name:"合成提示",target:"label",type:"secondary",startMs:570,durationMs:460,easing:"ease-out",frames:[{at:0,y:10,opacity:0},{at:.5,y:0,opacity:1},{at:1,y:-4,opacity:0}]}
    ],
    scene: `<div class="scene merge-scene">
      <span class="scene-label">04 / IDLE COMBINATION HINT</span>
      <div class="merge-hint">POSSIBLE MERGE DETECTED</div>
      <div class="orb-glow"></div><div class="merge-pulse" data-motion="pulse"></div>
      <div class="merge-orb orb-left" data-motion="left">🌿</div><div class="merge-orb orb-right" data-motion="right">💧</div>
      <div class="merge-core" data-motion="core">✦</div>
      <div class="merge-label" data-motion="label">合 成 可 用</div>
      <span class="scene-subtitle">轻预备 · 相互吸引 · 温柔回弹 · 间歇提醒</span>
    </div>`
  },
  {
    id: "card-flip", title: "秘藏翻牌", category: "transition", categoryLabel: "3D REVEAL",
    short: "卡牌翻转揭示", icon: "▱", color: "#b9a5ff", thumbBg: "rgba(155,140,255,.1)",
    description: "绕 Y 轴完成有支点的翻转，在中段做速度强调，正面出现时接一条高光。",
    intent: "通过正反面切换制造未知到揭晓的状态转换，确保翻转方向、空间透视和正面阅读稳定。",
    durationMs: 980, easing: "cubic-bezier(.22,.72,.2,1)",
    stages: ["蓄势", "翻转", "揭晓", "高光收尾"],
    parameters: [
      ["翻转角度", "180°"], ["总时长", "760 ms"], ["透视距离", "800 px"], ["高光轨道", "220 ms"], ["旋转轴", "Y 轴中心"], ["背面可见", "前半程"]
    ],
    tracks: [
      {name:"卡牌翻转",target:"card",type:"primary",startMs:80,durationMs:760,easing:"cubic-bezier(.22,.72,.2,1)",frames:[{at:0,rotateY:0,rotate:-3},{at:.16,rotateY:-12,rotate:2},{at:.52,rotateY:-112,rotate:0},{at:.72,rotateY:-180,rotate:0},{at:1,rotateY:-180,rotate:0}]},
      {name:"卡牌轻抬",target:"card",type:"secondary",startMs:0,durationMs:760,easing:"ease-out",frames:[{at:0,y:0,sx:1,sy:1},{at:.28,y:-12,sx:1.04,sy:1.04},{at:1,y:0,sx:1,sy:1}]},
      {name:"揭晓高光",target:"glint",type:"fx",startMs:620,durationMs:300,easing:"ease-out",frames:[{at:0,x:-120,opacity:0},{at:.45,x:0,opacity:.8},{at:1,x:125,opacity:0}]}
    ],
    scene: `<div class="scene flip-scene">
      <span class="scene-label">05 / SPATIAL TRANSFORMATION</span>
      <div class="flip-card-wrap">
        <div class="flip-card" data-motion="card">
          <div class="card-face card-back"><small>SEALED RELIC</small></div>
          <div class="card-face card-front"><span class="rare">★ LEGENDARY ★</span><span class="relic">🗝️</span><strong>星辉秘钥</strong></div>
        </div>
        <div class="card-glint" data-motion="glint"></div>
      </div>
      <span class="scene-subtitle">支点明确 · 透视翻转 · 关键帧揭晓</span>
    </div>`
  },
  {
    id: "split-recombine", title: "晶体重构", category: "system", categoryLabel: "PROCEDURAL FORM",
    short: "分裂与重组", icon: "⧖", color: "#9fceff", thumbBg: "rgba(127,180,255,.1)",
    description: "主体拆成四个几何片段，短暂分离后按顺序聚合，最后复原为完整晶体。",
    intent: "用可控的形态拆解与重组表现解锁/转换，不依赖外部碎片美术资产。",
    durationMs: 1260, easing: "cubic-bezier(.18,.8,.22,1)",
    stages: ["结构预备", "碎片分离", "轨迹回收", "主体重组"],
    parameters: [
      ["碎片数量", "4"], ["最大散开", "62 px"], ["碎片旋转", "±48°"], ["分离时长", "360 ms"], ["重组错峰", "55 ms"], ["形态恢复", "终态锁定"]
    ],
    tracks: [
      {name:"主体核心",target:"core",type:"primary",startMs:0,durationMs:1040,easing:"cubic-bezier(.18,.8,.22,1)",frames:[{at:0,sx:1,sy:1,opacity:1},{at:.22,sx:1.08,sy:.92,opacity:1},{at:.48,sx:.6,sy:.6,opacity:0},{at:.82,sx:.86,sy:.86,opacity:.6},{at:1,sx:1,sy:1,opacity:1}]},
      {name:"碎片一",target:"shard1",type:"primary",startMs:180,durationMs:880,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0,y:0,rotate:0,opacity:0},{at:.28,x:-53,y:-42,rotate:-48,opacity:1},{at:.62,x:-12,y:-8,rotate:-12,opacity:1},{at:1,x:0,y:0,rotate:0,opacity:0}]},
      {name:"碎片二",target:"shard2",type:"primary",startMs:220,durationMs:840,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0,y:0,rotate:0,opacity:0},{at:.28,x:55,y:-38,rotate:42,opacity:1},{at:.66,x:12,y:-7,rotate:10,opacity:1},{at:1,x:0,y:0,rotate:0,opacity:0}]},
      {name:"碎片三",target:"shard3",type:"primary",startMs:250,durationMs:810,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0,y:0,rotate:0,opacity:0},{at:.28,x:48,y:45,rotate:54,opacity:1},{at:.68,x:8,y:12,rotate:13,opacity:1},{at:1,x:0,y:0,rotate:0,opacity:0}]},
      {name:"碎片四",target:"shard4",type:"primary",startMs:290,durationMs:770,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,x:0,y:0,rotate:0,opacity:0},{at:.28,x:-47,y:42,rotate:-43,opacity:1},{at:.7,x:-10,y:10,rotate:-11,opacity:1},{at:1,x:0,y:0,rotate:0,opacity:0}]},
      {name:"射线扩散",target:"rays",type:"fx",startMs:120,durationMs:720,easing:"ease-out",frames:[{at:0,sx:.35,sy:.35,rotate:-8,opacity:0},{at:.3,sx:1,sy:1,rotate:0,opacity:.7},{at:1,sx:1.25,sy:1.25,rotate:9,opacity:0}]},
      {name:"重构光脉冲",target:"pulse-ring",type:"fx",startMs:860,durationMs:350,easing:"ease-out",frames:[{at:0,sx:.5,sy:.5,opacity:0},{at:.3,sx:1,sy:1,opacity:.85},{at:1,sx:1.7,sy:1.7,opacity:0}]}
    ],
    scene: `<div class="scene split-scene">
      <span class="scene-label">06 / SHAPE RECONSTRUCTION</span>
      <div class="split-panel">
        <span class="split-title">CRYSTAL CORE</span>
        <span class="split-gem" data-motion="core">💠</span>
        <i class="shard one" data-motion="shard1"></i><i class="shard two" data-motion="shard2"></i><i class="shard three" data-motion="shard3"></i><i class="shard four" data-motion="shard4"></i><i class="rebuild-ring" data-motion="pulse-ring"></i>
      </div>
      <span class="split-caption">BREAK APART · REASSEMBLE</span>
      <span class="scene-subtitle">几何拆分 · 轨迹回收 · 完整形态复原</span>
    </div>`
  },
  {
    id: "level-up", title: "等级突破", category: "system", categoryLabel: "MILESTONE CELEBRATION",
    short: "升级庆祝表现", icon: "✹", color: "#ffca80", thumbBg: "rgba(255,181,107,.1)",
    description: "以中心徽章冲击建立重要性，光环与星点围绕主动作接力，最后交出等级信息。",
    intent: "突出玩家成长的关键时刻，主视觉冲击清楚，装饰光效只强化升级事件。",
    durationMs: 1520, easing: "cubic-bezier(.16,1,.3,1)",
    stages: ["能量聚集", "冲击释放", "徽章显现", "等级确认"],
    parameters: [
      ["主体弹出", "430 ms"], ["光环扩散", "680 ms"], ["徽章过冲", "1.12×"], ["星点数量", "4"], ["数字揭示", "主体稳定后"], ["循环", "单次事件"]
    ],
    tracks: [
      {name:"能量光环",target:"halo",type:"fx",startMs:0,durationMs:900,easing:"ease-out",frames:[{at:0,sx:.35,sy:.35,opacity:0},{at:.28,sx:1,sy:1,opacity:.7},{at:1,sx:1.55,sy:1.55,opacity:0}]},
      {name:"中心徽章",target:"badge",type:"primary",startMs:190,durationMs:540,easing:"cubic-bezier(.16,1,.3,1)",frames:[{at:0,sx:.3,sy:.3,rotate:-18,opacity:0},{at:.62,sx:1.12,sy:1.12,rotate:5,opacity:1},{at:1,sx:1,sy:1,rotate:0,opacity:1}]},
      {name:"标题",target:"title",type:"secondary",startMs:660,durationMs:420,easing:"ease-out",frames:[{at:0,y:15,opacity:0},{at:.5,y:-2,opacity:1},{at:1,y:0,opacity:1}]},
      {name:"星点",target:"spark",type:"fx",startMs:360,durationMs:680,easing:"ease-out",frames:[{at:0,sx:.2,sy:.2,opacity:0},{at:.28,sx:1.25,sy:1.25,opacity:1},{at:1,sx:.55,sy:.55,opacity:0}]},
      {name:"等级数字",target:"number",type:"secondary",startMs:870,durationMs:340,easing:"cubic-bezier(.2,.8,.2,1)",frames:[{at:0,y:11,opacity:0},{at:.6,y:-2,opacity:1},{at:1,y:0,opacity:1}]}
    ],
    scene: `<div class="scene level-scene">
      <span class="scene-label">07 / PLAYER PROGRESSION</span>
      <div class="level-rays" data-motion="rays"></div><div class="level-halo" data-motion="halo"></div>
      <div class="level-title" data-motion="title">LEVEL UP</div>
      <div class="level-badge" data-motion="badge">✦</div>
      <div class="level-stars" data-motion="stars"><span>✧</span><span>✦</span></div>
      <div class="level-number" data-motion="number">LEVEL 08 → 09</div>
      <span class="level-spark" style="left:28%;top:42%" data-motion="spark">✦</span><span class="level-spark" style="right:27%;top:46%" data-motion="spark">✧</span>
      <span class="scene-subtitle">蓄能 · 冲击 · 里程碑显现 · 状态确认</span>
    </div>`
  }
];
