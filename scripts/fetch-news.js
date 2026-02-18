#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const AI_KEYWORDS = ['ai', 'intelligence', 'learning', 'gpt', 'llm', 'model', 'robot', 'gpu', 'nvidia', 'openai', 'deepseek', 'tech', 'silicon'];

function isAIRelated(title) {
    const lowerTitle = title.toLowerCase();
    return AI_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

async function fetchHackerNews() {
    try {
        const { data: storyIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        for (const storyId of storyIds.slice(0, 60)) {
            const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            if (story && story.title && isAIRelated(story.title)) {
                articles.push({
                    title: story.title,
                    url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
                    source: 'GLOBAL TECH NETWORK'
                });
            }
            if (articles.length >= 8) break;
        }
        return articles;
    } catch (e) { return []; }
}

async function main() {
    console.log('📡 正在抓取全球 AI 情報...');
    const articles = await fetchHackerNews();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}-ai-insights.md`;

    const content = `---
layout: post
title: "AI INSIGHTS 每日情報：全球人工智慧動態彙整"
date: ${new Date().toISOString()}
summary: "今日重點報導：${articles[0] ? articles[0].title : '產業趨勢更新'} 等多項重大情報..."
---

> **本報訊**：AI INSIGHTS 頻道為您追蹤今日最值得關注的技術突破與產業動態。

---

## 🕒 今日頭條動態

${articles.map((a, i) => `
### 🟢 ${a.title}
*由 ${a.source} 現場報導*

今日該項目在技術社群引發高度關注。本頻道分析指出，這代表了當前產業對於技術落地的最新探索。您可以透過以下連結獲取完整情報：
[🔗 查看原文報導](${a.url})
`).join('\n\n')}

---

## 💡 頻道評論
今日的動態顯示 AI 領域正在從單純的模型競爭轉向多元化的應用場景。我們會持續為您追蹤後續發展。

**AI INSIGHTS 編輯團隊 整理報導**
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
    fs.writeFileSync(path.join(POSTS_DIR, filename), content);
    console.log('✅ 新聞頻道內容已生成');
}

main();
