#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');

// 放寬關鍵字
const AI_KEYWORDS = ['ai', 'intelligence', 'learning', 'gpt', 'llm', 'model', 'robot', 'gpu', 'nvidia', 'openai', 'deepseek'];

function isAIRelated(title) {
    const lowerTitle = title.toLowerCase();
    return AI_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

async function fetchHackerNews() {
    try {
        const { data: storyIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        for (const storyId of storyIds.slice(0, 50)) {
            const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            if (story && story.title && isAIRelated(story.title)) {
                articles.push({
                    title: story.title,
                    url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
                    source: 'Hacker News',
                    date: new Date()
                });
            }
        }
        return articles;
    } catch (e) { return []; }
}

async function main() {
    console.log('📡 正在抓取新聞...');
    const articles = await fetchHackerNews();
    
    if (articles.length === 0) {
        console.log('⚠️ 沒抓到新聞，產生一篇測試文章確保網站運作');
        articles.push({
            title: "AI 新聞系統正式上線",
            url: "https://github.com/ebeesnetmo-svg/ai-news-blog-node",
            source: "系統通知",
            date: new Date()
        });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}-ai-news.md`;
    const content = `---
layout: post
title: "AI 新聞摘要 - ${dateStr}"
date: ${new Date().toISOString()}
---

# 🤖 今日 AI 新聞摘要

${articles.map((a, i) => `### ${i+1}. ${a.title}\n- 來源: ${a.source}\n- [連結](${a.url})`).join('\n\n')}
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
    fs.writeFileSync(path.join(POSTS_DIR, filename), content);
    console.log('✅ 文章已生成');
}

main();
