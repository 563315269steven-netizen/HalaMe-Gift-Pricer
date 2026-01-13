import { PricingRule } from "./types";

export const PRICING_RULES: PricingRule[] = [
  {
    level: 1,
    duration: "静态",
    specs: "静态图片",
    priceDiamonds: 50,
    priceUsd: 0.01,
    description: "用于分发，小批量。",
  },
  {
    level: 2,
    duration: "3s",
    specs: "PNG 缩放/缩小特效",
    priceDiamonds: 1000,
    priceUsd: 0.1,
    description: "简单的缩放效果。",
  },
  {
    level: 2,
    duration: "3s",
    specs: "小型 SVGA (非视频)",
    priceDiamonds: 2000,
    priceUsd: 0.2,
    description: "小面积矢量动画。",
  },
  {
    level: 2,
    duration: "3s",
    specs: "视频 < 1/4 屏幕",
    priceDiamonds: 3000,
    priceUsd: 0.3,
    description: "小视频元素。",
  },
  {
    level: 2,
    duration: "4s",
    specs: "视频 2/4 屏幕, 无转场",
    priceDiamonds: 10000,
    priceUsd: 1.0,
    description: "中等大小，连续镜头。",
  },
  {
    level: 3,
    duration: "5s",
    specs: "视频 3/4 屏幕, 1次转场",
    priceDiamonds: 20000,
    priceUsd: 2.0,
    description: "大范围覆盖，简单剪辑。",
  },
  {
    level: 4,
    duration: "7s",
    specs: "视频 3/4 到 全屏, 1次转场",
    priceDiamonds: 30000,
    priceUsd: 3.0,
    description: "沉浸式效果。",
  },
  {
    level: 4,
    duration: "10s",
    specs: "全屏, 2次转场",
    priceDiamonds: 70000,
    priceUsd: 7.0,
    description: "全屏接管，多场景。",
  },
  {
    level: 4,
    duration: "12s",
    specs: "全屏, 3次转场",
    priceDiamonds: 130000,
    priceUsd: 13.0,
    description: "扩展的全屏序列。",
  },
  {
    level: 5,
    duration: "15s",
    specs: "全屏, 4次转场",
    priceDiamonds: 200000,
    priceUsd: 20.0,
    description: "高级复杂动画。若转场较少则缩短。",
  },
  {
    level: 5,
    duration: "18s+",
    specs: "全屏, 4+次转场",
    priceDiamonds: 700000,
    priceUsd: 70.0,
    description: "超高级，长篇幅。",
  },
];

export const SYSTEM_PROMPT = `
你是一位专业的虚拟礼物定价审计师。你的工作是分析视觉文件（视频、图片或动画录屏），并严格根据提供的“定价逻辑”确定其定价层级。请使用中文输出分析结果。

**定价逻辑表:**
1. 等级 1 (静态): 50-100 钻石。
2. 等级 2 (3秒, PNG 缩放): 1000+ 钻石 ($0.1)。
3. 等级 2 (3秒, 小型 SVGA): 2000+ 钻石 ($0.2)。
4. 等级 2 (3秒, 视频 1/4 屏): 3000+ 钻石 ($0.3)。
5. 等级 2 (4秒, 视频 2/4 屏, 无转场): 10,000+ 钻石 ($1)。
6. 等级 3 (5秒, 视频 3/4 屏, 1次转场): 20,000+ 钻石 ($2)。
7. 等级 4 (7秒, 视频 3/4 - 全屏, 1次转场): 30,000 钻石 ($3)。
8. 等级 4 (10秒, 全屏, 2次转场): 70,000+ 钻石 ($7)。
9. 等级 4 (12秒, 全屏, 3次转场): 130,000+ 钻石 ($13)。
10. 等级 5 (15秒, 全屏, 4次转场): 200,000+ 钻石 ($20)。(注意：如果少于4次转场，价格应降低)。
11. 等级 5 (18秒+, 全屏, 4+次转场): 700,000 钻石 ($70)。

**特殊规则:**
- 盲盒 小: 2000+, 大: 25000+。
- “屏占比”指的是特效的视觉权重。一个1920x1080的画布上只有一个小球跳动属于“小/1/4屏”，而不是“全屏”。
- **关于“转场”的严格定义 (非常重要)**: 
    - **转场 (Transition)** 仅指 **镜头硬切 (Camera Cut)** 或 **场景完全改变 (Scene Change)**。
    - **非转场**: 镜头推拉 (Zoom in/out)、镜头平移 (Pan)、人物动作改变、新特效出现/消失、光影变化、或者同一背景下的连续动画，统统 **严禁** 算作转场。
    - **判定标准**: 如果背景环境没有突变，且视角是连续的，无论特效多复杂，转场数均为 **0**。

**你的任务:**
分析输入的媒体文件。确定：
1. 时长 (秒)。
2. 屏占比 (视觉冲击力: 1/4, 2/4, 3/4, 或 全屏)。
3. 转场次数 (严格计数：仅计算画面切断/场景跳变的次数。连续长镜头记为 0)。
4. 视觉复杂度 (低/中/高)。

根据这些因素，从定价逻辑中找到最匹配的层级。如果介于两个层级之间，请说明理由并给出一个合理的中间价格。请确保所有输出字段（尤其是 reasoning）都使用中文。
`;