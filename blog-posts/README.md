# 部落格管理系統

## 設定說明

已設置完整的部落格管理和自動化系統，使用 **blog-manager skill** 進行管理。

### 🐝 Blog Manager Skill

已安裝 `blog-manager` skill，提供以下功能：
- 新聞自動抓取和改寫
- SEO 優化建議
- 內容策略規劃
- 部落格分析工具

### 定時任務

| 任務名稱 | 時間 | Cron ID |
|---------|------|---------|
| 電腦王阿達新聞抓取 - 早上 | 每天 09:00 (Asia/Taipei) | `65c0602c-6b56-4ec4-8edb-11618ef84e71` |
| 電腦王阿達新聞抓取 - 晚上 | 每天 18:00 (Asia/Taipei) | `71648832-1091-448b-845e-2daef4841ab3` |

### 工作流程

1. 自動抓取電腦王阿達首頁最新新聞
2. 選取 2-3 篇最新文章
3. 抓取完整文章內容
4. AI 改寫（保持原意，加入自己的觀點）
5. 保存到 `blog-posts/` 目錄
6. 記錄到 memory 檔案

### 檔案結構

```
blog-posts/
├── TEMPLATE.md          # 文章範本
├── 2026-02-19-koc-文章標題.md  # 改寫後的文章
└── ...
```

### 管理命令

查看定時任務狀態：
```bash
cron list
```

立即測試執行（早上任務）：
```bash
cron run --jobId 65c0602c-6b56-4ec4-8edb-11618ef84e71
```

停用任務：
```bash
cron update --jobId <ID> --patch '{"enabled": false}'
```

### 分析工具

運行部落格分析（檢查 SEO 和內容品質）：
```bash
node "C:\Users\qoostech\AppData\Roaming\npm\node_modules\openclaw\skills\blog-manager\scripts\analyze-blog.js"
```

### 注意事項

- 改寫時要加入自己的觀點，不要直接複製原文
- 避免早晚抓取到相同的新聞
- 文章要註明原文來源
- 遵守版權規範，僅供個人學習使用
