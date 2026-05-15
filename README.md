# I人的馋嘴日记 · 美食地图网站

## 结构

```
ihcr-diary/
├── index.html      # 首页（品牌介绍）
├── map.html        # 全屏美食地图（主页面）
├── data/posts.json # 所有食记数据（每发一篇加一条）
├── css/main.css
└── js/map.js
```

品牌设定见：`.agents/product-marketing.md`

## 本地预览（重要）

**不要**直接双击 HTML 打开。浏览器会拦截 `fetch('data/posts.json')`，地图会没有数据。

在项目文件夹运行：

```powershell
cd "c:\Users\timot\Documents\I Have a Plan\ihcr-diary"
python -m http.server 8080
```

浏览器打开：http://localhost:8080/map.html

## 每发一篇笔记

在 `data/posts.json` 增加一条（或交给我更新），字段：

| 字段 | 说明 |
|------|------|
| id | 唯一，如 `2026-05-20-nasi-lemak` |
| title | 店名/标题 |
| location | 地址文字 |
| lat, lng | 坐标（我可从 Google Maps 链接解析） |
| category | hawker / kopitiam / cafe / restaurant |
| price | 如 RM8–15 |
| excerpt | 列表摘要 |
| body | 完整正文 |
| introvertTip | I人贴士（可选） |
| xhsLink | 小红书笔记链接 |
| date | 发布日期 |

## 免费上线

1. GitHub 新建 repo，上传 `ihcr-diary` 文件夹内容  
2. Settings → Pages → Deploy from branch → `main` / root  
3. 访问 `https://你的用户名.github.io/repo名/map.html`

## 旧版

`XHS TestV.html` 为初版；请改用本目录 `ihcr-diary/`。
