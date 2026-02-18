# 🤖 AI 每日新聞 - Node.js 版本

> 每天自動更新的 AI 領域最新資訊 | 無需 Ruby，只需 Node.js

[![Deploy](https://github.com/your-username/ai-news-blog-node/actions/workflows/daily-news.yml/badge.svg)](https://github.com/your-username/ai-news-blog-node/actions)

---

## ✨ 特色

- 🆓 **完全免費** - GitHub Pages 託管
- 🤖 **自動更新** - 每日定時抓取新聞
- 📝 **Markdown** - 文章易讀易編輯
- 🚀 **快速部署** - Git push 即上線
- 📱 **RWD** - 手機/平板/桌面自適應
- 🔒 **Private Repo** - 程式碼私有

---

## 🚀 快速開始

### 1. 安裝 Node.js（如果還沒有）

```powershell
# 檢查是否已安裝
node --version

# 如果沒有，下載安裝：https://nodejs.org/
```

### 2. 安裝依賴

```powershell
cd ai-news-blog-node
npm install
```

### 3. 設定配置

編輯 `config.json`：

```json
{
  "title": "AI 每日新聞",
  "github": {
    "username": "你的 GitHub 使用者名稱",
    "repo": "ai-news-blog-node"
  }
}
```

### 4. 測試新聞抓取

```powershell
npm run fetch
```

### 5. 本地預覽

```powershell
npm run build
npm run serve
```

開啟 http://localhost:4000

### 6. 部署到 GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的 username/ai-news-blog-node.git
git push -u origin main
```

### 7. 啟用 GitHub Pages

1. 前往 GitHub Repo → **Settings** → **Pages**
2. Source 選擇 **GitHub Actions**
3. 等待首次部署完成

---

## 📁 目錄結構

```
ai-news-blog-node/
├── config.json          # 網站配置
├── package.json         # Node.js 依賴
├── _posts/              # Markdown 文章
├── _site/               # 生成的 HTML（不要 commit）
├── scripts/
│   ├── fetch-news.js    # 新聞抓取
│   ├── build.js         # 網站生成
│   └── serve.js         # 本地伺服器
└── .github/workflows/
    └── daily-news.yml   # GitHub Actions
```

---

## 📋 命令

| 命令 | 說明 |
|------|------|
| `npm run fetch` | 抓取今日新聞 |
| `npm run fetch -- --auto` | 抓取並自動 commit |
| `npm run build` | 建立靜態網站 |
| `npm run serve` | 本地預覽 |
| `npm run dev` | 開發模式（自動重載） |

---

## ⚙️ GitHub Actions 設定

在 GitHub Repo 的 **Settings** → **Secrets and variables** → **Actions** 中加入：

| Secret | 說明 |
|--------|------|
| `GITHUB_USERNAME` | 你的 GitHub 使用者名稱 |
| `GITHUB_TOKEN` | Personal Access Token（repo 權限） |

---

## 🔧 自訂

### 修改新聞來源

編輯 `scripts/fetch-news.js`，加入新的 API：

```javascript
async function fetchYourSource() {
    const { data } = await axios.get('https://api.example.com/news');
    // 處理資料...
    return articles;
}
```

### 修改更新時間

編輯 `.github/workflows/daily-news.yml`：

```yaml
schedule:
  - cron: '0 8 * * *'  # 改為你的時區
```

### 自訂樣式

編輯 `scripts/build.js` 中的 CSS。

---

## 📊 新聞來源

目前支援：

- **Hacker News** - https://news.ycombinator.com/
- **Reddit r/MachineLearning** - https://reddit.com/r/MachineLearning

歡迎貢獻更多來源！

---

## 📝 License

MIT

---

## 🙏 致謝

- [Hacker News API](https://github.com/HackerNews/API)
- [Reddit API](https://www.reddit.com/dev/api/)
- [marked](https://marked.js.org/) - Markdown 解析器
