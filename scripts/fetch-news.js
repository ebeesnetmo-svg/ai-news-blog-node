#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');

// 專業新聞播報模板
const NEWS_TEMPLATES = [
    "根據本台獲得的最新消息，{title} 在今日引發了業界高度關注。分析師認為，這項發展將深遠影響 AI 的未來布局。",
    "技術社群傳來重要情報：{title}。這項突破性進展顯示了當前人工智慧在技術落地上的新高度。",
    "今日最受矚目的動態非 {title} 莫屬。我們對此進行了深度追蹤，這不僅是技術更新，更是市場轉向的關鍵信號。"
];

function getRandomTemplate(title) {
    const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
    return template.replace('{title}', title);
}

async function fetchHackerNews() {
    try {
        console.log('📡 正在連線全球技術網絡...');
        const { data: storyIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        
        // 抓取關鍵新聞
        for (const storyId of storyIds.slice(0, 30)) {
            const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            const title = story.title.toLowerCase();
            
            // 關鍵字過濾
            if (title.includes('ai') || title.includes('gpt') || title.includes('nvidia') || title.includes('model')) {
                articles.push({
                    title: story.title,
                    url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
                    reporter: 'TECH REPORTER',
                    analysis: getRandomTemplate(story.title)
                });
            }
            if (articles.length >= 5) break;
        }
        return articles;
    } catch (e) { return []; }
}

async function main() {
    const articles = await fetchHackerNews();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}-ai-insights.md`;

    let reportBody = `> **【AI INSIGHTS 頻道】每日新聞專題報導**\n\n`;
    reportBody += `### 🌍 全球產業情勢觀測\n\n今日 AI 領域呈現出高度活躍的態勢，多項技術突破同時浮現。以下是本頻道為您整理的深度報導：\n\n---\n\n`;

    articles.forEach((a, i) => {
        reportBody += `### 🎙️ 專題報導 ${i+1}：${a.title}\n`;
        reportBody += `**【本台特約記者報導】** ${a.analysis}\n\n`;
        reportBody += `**核心摘要：** 目前這項發展已在開發者社群引發熱烈討論。從我們的觀測來看，這不僅僅是代碼的更新，更代表了硬體架構與軟體算法的進一步融合。\n\n`;
        reportBody += `> 🔎 **情報來源：** [點擊此處閱讀原文詳細報導](${a.url})\n\n---\n\n`;
    });

    reportBody += `\n### 📺 頻道觀點\n今日的情報顯示，AI 技術正加速與現實應用場景接軌。我們建議關注相關企業的後續動作，這可能會是下一個季度的市場風向標。\n\n**AI INSIGHTS NETWORK 編輯群 綜合報導**`;

    const fullContent = `---
layout: post
title: "AI 新聞頻道：今日全球人工智慧動態深度報導"
date: ${new Date().toISOString()}
summary: "今日頭條：${articles[0] ? articles[0].title : 'AI 產業趨勢更新'}。本頻道帶來深度解析與專題報導。"
---

${reportBody}
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
    fs.writeFileSync(path.join(POSTS_DIR, filename), fullContent);
    console.log('✅ 專業新聞報導內容已生成');
}

main();
