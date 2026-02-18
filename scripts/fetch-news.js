#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const API_KEY = process.env.ARK_API_KEY;

/**
 * 調用 BytePlus GLM-4 進行 AI 評論撰寫
 */
async function generateAIAnalysis(newsList) {
    console.log('🤖 正在啟動 GLM-4 AI 撰稿引擎進行深度分析...');
    
    const prompt = `
你是一位專業的 AI 產業 Blogger，擁有犀利的主觀觀點和深度的技術背景。
請針對以下抓取到的今日 AI 新聞，撰寫一篇專業的專欄報導。

要求：
1. 為這篇報導起一個極具吸引力的、有個人風格的標題。
2. 撰寫一段精彩的「社論導語」，分析今日產業的整體趨勢，語氣要主觀、專業、帶點批判性或遠見。
3. 針對每則新聞，提供「事實摘要」與「深度評論」。評論要涉及技術影響、商業權力鬥爭或未來預測。
4. 使用繁體中文撰寫。
5. 格式使用 Markdown，保持優美的排版。

新聞列表：
${newsList.map((n, i) => `${i+1}. ${n.title} (來源: ${n.url})`).join('\n')}
`;

    try {
        const response = await axios.post(
            'https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions',
            {
                model: "glm-4-7-251222",
                messages: [
                    { role: "system", content: "你是一位精通 AI 產業的資深專欄作家，擅長撰寫具備深度的 Web 3.0 風格報導。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (e) {
        console.error('❌ AI 撰稿失敗:', e.response ? e.response.data : e.message);
        return null;
    }
}

async function fetchNews() {
    try {
        console.log('📡 正在獲取全球技術源資料...');
        const { data: storyIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        
        for (const storyId of storyIds.slice(0, 50)) {
            const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
            const title = story.title.toLowerCase();
            if (title.includes('ai') || title.includes('gpt') || title.includes('gpu') || title.includes('nvidia') || story.score > 200) {
                articles.push({
                    title: story.title,
                    url: story.url || `https://news.ycombinator.com/item?id=${storyId}`
                });
            }
            if (articles.length >= 6) break;
        }
        return articles;
    } catch (e) { return []; }
}

async function main() {
    const newsList = await fetchNews();
    if (newsList.length === 0) return console.log('今日無重要 AI 新聞。');

    const aiContent = await generateAIAnalysis(newsList);
    if (!aiContent) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}-ai-intel.md`;

    // 提取 AI 生成的標題（假設 AI 第一行會給標題）
    const lines = aiContent.split('\n');
    let title = lines[0].replace(/#/g, '').trim();
    if (!title) title = `AI PERSPECTIVE：${dateStr} 產業評論`;

    const fullMarkdown = `---
layout: post
title: "${title}"
date: ${new Date().toISOString()}
summary: "GLM-4 驅動：今日 AI 產業深度解析與 Blogger 主觀觀點。"
---

${aiContent}

---
*本文由 BytePlus GLM-4 模型自動撰寫並由 AI INSIGHTS 頻道發布。*
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
    fs.writeFileSync(path.join(POSTS_DIR, filename), fullMarkdown);
    console.log(`✅ 真 · AI 撰稿文章已生成：${filename}`);
}

main();
