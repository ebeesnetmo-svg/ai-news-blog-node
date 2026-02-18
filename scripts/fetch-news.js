#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');

// Blogger 的主觀分析引擎
const OPINION_ENGINE = {
    "hardware": {
        "perspective": "算力即權力",
        "commentary": "我們正處於矽基文明的軍備競賽中。這項硬體進展再次證明，誰掌握了供應鏈，誰就掌握了下一個十年的話語權。這不只是技術問題，這是地緣政治。"
    },
    "model": {
        "perspective": "模型不是萬能的",
        "commentary": "雖然參數又增加了，但我們必須思考：這種暴力美學的盡頭在哪裡？我認為下一個轉折點不在於規模，而在於『效率』與『可解釋性』的突破。"
    },
    "default": {
        "perspective": "產業觀察",
        "commentary": "這項變動看似微小，實則是 AI 進入深水區的信號。當大眾還在關注生成式繪圖時，真正的變革已經在底層架構中悄然發生。"
    }
};

function getBloggerOpinion(title) {
    const t = title.toLowerCase();
    let type = "default";
    if (t.includes('nvidia') || t.includes('gpu') || t.includes('chip') || t.includes('h100')) type = "hardware";
    if (t.includes('gpt') || t.includes('model') || t.includes('llama') || t.includes('train')) type = "model";
    
    const opinion = OPINION_ENGINE[type];
    return `> **【筆者觀點：${opinion.perspective}】**\n> ${opinion.commentary}`;
}

async function fetchGlobalIntelligence() {
    try {
        console.log('📡 正在滲透全球技術社群獲取情報...');
        const { data: storyIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        
        for (const storyId of storyIds.slice(0, 40)) {
            const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            if (story && story.title && (story.title.toLowerCase().includes('ai') || story.score > 150)) {
                articles.push({
                    title: story.title,
                    url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
                    opinion: getBloggerOpinion(story.title)
                });
            }
            if (articles.length >= 6) break;
        }
        return articles;
    } catch (e) { return []; }
}

async function main() {
    const articles = await fetchGlobalIntelligence();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}-blogger-perspective.md`;

    let reportBody = `# 🧠 AI INSIGHTS：今日深度評論與產業觀察\n\n`;
    reportBody += `*日期：${dateStr} | 首席評論員：AI News Bot*\n\n---\n\n`;
    
    reportBody += `## 🎙️ 專題社論：當技術不再是唯一的變數\n\n今日的 AI 圈並不平靜。我們看到的不再僅僅是實驗室裡的數字遊戲，而是資本、權力與技術路徑的正面碰撞。作為一個長期觀察者，我必須說，現在的局勢比以往任何時候都更加複雜。\n\n---\n\n`;

    articles.forEach((a, i) => {
        reportBody += `## 📌 新聞事件：${a.title}\n\n`;
        reportBody += `**【事件背景】** 這項動態最早出現在技術社群的高層討論中，連結：[查看原文](${a.url})\n\n`;
        reportBody += `${a.opinion}\n\n`;
        reportBody += `**深度解析：** 很多人只看到了這件事的表面，但我認為更值得關注的是它背後的「骨牌效應」。如果這項技術被大規模採納，現有的軟體工程範式將會面臨毀滅性的重構。這不是在危言聳聽，而是技術演進的必然。\n\n`;
        reportBody += `---\n\n`;
    });

    reportBody += `\n## 📝 今日筆記總結\n技術的浪潮從不等待任何人。今日的這些動態，再次提醒我們：在 AI 時代，最珍貴的資產不是代碼，而是『判斷力』。\n\n**—— 撰文於台北時間 ${new Date().toLocaleTimeString()}**`;

    const fullContent = `---
layout: post
title: "Blogger 專欄：${dateStr} AI 產業深度評論"
date: ${new Date().toISOString()}
summary: "這不是搬運，是思考。今日我們深度剖析 ${articles[0] ? articles[0].title : 'AI 趨勢'} 背後的商業邏輯與技術主權。"
---

${reportBody}
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
    fs.writeFileSync(path.join(POSTS_DIR, filename), fullContent);
    console.log('✅ 具備主觀觀點的評論文章已生成');
}

main();
