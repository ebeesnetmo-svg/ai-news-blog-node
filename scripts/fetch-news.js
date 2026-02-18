#!/usr/bin/env node
/**
 * AI 新聞抓取腳本
 * 每天自動抓取 AI 相關新聞，生成 Markdown 文章
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 設定
const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const CONFIG_FILE = path.join(BLOG_ROOT, 'config.json');

// AI 相關關鍵字
const AI_KEYWORDS = [
    'artificial intelligence', 'machine learning', 'deep learning',
    'neural network', 'LLM', 'large language model', 'GPT', 'AI',
    'transformer', 'diffusion', 'generative AI', 'computer vision',
    'NLP', 'natural language processing', 'reinforcement learning',
    '人工智慧', '機器學習', '深度學習', '大語言模型'
];

// 檢查是否為 AI 相關
function isAIRelated(title) {
    const lowerTitle = title.toLowerCase();
    return AI_KEYWORDS.some(keyword => lowerTitle.includes(keyword.toLowerCase()));
}

// 抓取 Hacker News
async function fetchHackerNews() {
    try {
        console.log('  → Hacker News...');
        const { data: storyIds } = await axios.get(
            'https://hacker-news.firebaseio.com/v0/topstories.json',
            { timeout: 10000 }
        );

        const articles = [];
        for (const storyId of storyIds.slice(0, 30)) {
            try {
                const { data: story } = await axios.get(
                    `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`,
                    { timeout: 5000 }
                );

                if (story && story.type === 'story' && story.title) {
                    if (isAIRelated(story.title)) {
                        articles.push({
                            title: story.title,
                            url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
                            source: 'Hacker News',
                            score: story.score || 0,
                            time: new Date((story.time || 0) * 1000)
                        });
                    }
                }
            } catch (e) {
                // 忽略單一文章錯誤
            }
        }

        console.log(`    找到 ${articles.length} 篇 AI 相關文章`);
        return articles;
    } catch (e) {
        console.error(`    錯誤：${e.message}`);
        return [];
    }
}

// 抓取 Reddit MachineLearning
async function fetchRedditML() {
    try {
        console.log('  → Reddit r/MachineLearning...');
        const { data } = await axios.get(
            'https://www.reddit.com/r/MachineLearning/hot.json',
            {
                timeout: 10000,
                headers: { 'User-Agent': 'AI-News-Bot/1.0' }
            }
        );

        const articles = [];
        const posts = data.data?.children || [];

        for (const post of posts.slice(0, 20)) {
            const postData = post.data;
            if (postData && postData.title && isAIRelated(postData.title)) {
                articles.push({
                    title: postData.title,
                    url: `https://reddit.com${postData.permalink}`,
                    source: 'Reddit r/MachineLearning',
                    score: postData.score || 0,
                    time: new Date((postData.created_utc || 0) * 1000)
                });
            }
        }

        console.log(`    找到 ${articles.length} 篇 AI 相關文章`);
        return articles;
    } catch (e) {
        console.error(`    錯誤：${e.message}`);
        return [];
    }
}

// 生成 Markdown 文章
function generateMarkdownPost(articles, date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    const filename = `${dateStr}-ai-news-digest.md`;
    const filepath = path.join(POSTS_DIR, filename);

    // 如果文章已存在，跳過
    if (fs.existsSync(filepath)) {
        console.log(`文章已存在：${filename}`);
        return false;
    }

    const formattedDate = date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let content = `---
layout: post
title: "AI 新聞摘要 - ${formattedDate}"
date: ${date.toISOString()}
categories: AI News
tags: [AI, 新聞摘要，機器學習，深度學習]
summary: 今日 AI 領域重要新聞摘要
---

# 📰 AI 新聞摘要

**日期：** ${formattedDate}  
**來源：** 自動抓取整理

---

## 今日重點

`;

    if (articles.length > 0) {
        articles.slice(0, 10).forEach((article, i) => {
            const timeStr = article.time ? article.time.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

            content += `
### ${i + 1}. ${article.title}

- **來源：** ${article.source}
- **時間：** ${timeStr}
- **連結：** [${article.url}](${article.url})

`;
        });
    } else {
        content += '\n*今日暫無符合條件的新聞*\n';
    }

    content += `
---

## 關於

本摘要由自動化系統每日生成，抓取各大技術社群的 AI 相關討論。

**資料來源：**
- Hacker News
- Reddit r/MachineLearning
- 更多來源持續增加中...

---

*最後更新：${new Date().toLocaleString('zh-TW')}*
`;

    // 確保目錄存在
    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✓ 已生成文章：${filename}`);
    return true;
}

// Git commit & push
async function gitCommitPush(message = 'Daily AI news update') {
    const simpleGit = require('simple-git');
    const git = simpleGit(BLOG_ROOT);

    try {
        const timestamp = new Date().toLocaleString('zh-TW');
        const commitMsg = `[auto] ${message} - ${timestamp}`;

        await git.add('_posts/');
        const status = await git.status();

        if (status.files.length > 0) {
            await git.commit(commitMsg);
            await git.push();
            console.log('✓ Git commit & push 完成');
            return true;
        } else {
            console.log('沒有變更需要 commit');
            return false;
        }
    } catch (e) {
        console.error(`Git 錯誤：${e.message}`);
        return false;
    }
}

// 主程式
async function main() {
    console.log('='.repeat(50));
    console.log('AI 新聞抓取程式');
    console.log('='.repeat(50));

    console.log('\n📡 正在抓取新聞...');

    const allArticles = [];

    // 抓取來源
    const hnArticles = await fetchHackerNews();
    allArticles.push(...hnArticles);

    const redditArticles = await fetchRedditML();
    allArticles.push(...redditArticles);

    // 去重
    const seenUrls = new Set();
    const uniqueArticles = allArticles.filter(article => {
        if (seenUrls.has(article.url)) return false;
        seenUrls.add(article.url);
        return true;
    });

    console.log(`\n✓ 總共找到 ${uniqueArticles.length} 篇獨特文章`);

    // 生成文章
    console.log('\n📝 正在生成 Markdown 文章...');
    const created = generateMarkdownPost(uniqueArticles);

    if (created) {
        console.log('\n💾 是否要 commit 並 push 到 GitHub？');
        console.log('輸入 y 確認 (或按 Enter 跳過): ');

        // 非互動模式自動 commit
        if (process.argv.includes('--auto')) {
            await gitCommitPush();
        } else {
            // 互動模式等待輸入
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    gitCommitPush();
                } else {
                    console.log('跳過 git 操作');
                }
                readline.close();
            });
        }
    } else {
        console.log('沒有新文章需要生成');
    }

    console.log('\n' + '='.repeat(50));
    console.log('完成！');
    console.log('='.repeat(50));
}

// 執行
main().catch(console.error);
