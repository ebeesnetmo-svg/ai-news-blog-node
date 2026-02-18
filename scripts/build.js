#!/usr/bin/env node
/**
 * 靜態網站生成器 - 優化路徑版本
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const OUTPUT_DIR = path.join(BLOG_ROOT, '_site');
const CONFIG_FILE = path.join(BLOG_ROOT, 'config.json');

// 硬編碼子路徑，確保 GitHub Pages 連結正確
const BASE_URL = '/ai-news-blog-node';

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    return { title: 'AI 每日新聞', description: '每天自動更新的 AI 領域最新資訊' };
}

function createHtmlTemplate(title, content, config) {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${config.title}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
        header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        nav { margin-top: 10px; }
        nav a { margin-right: 15px; color: #2563eb; text-decoration: none; }
        article { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        h2 a { color: #333; text-decoration: none; }
        .date { color: #666; font-size: 0.9em; }
        footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.8em; color: #888; }
    </style>
</head>
<body>
    <header>
        <h1>🤖 ${config.title}</h1>
        <p>${config.description}</p>
        <nav>
            <a href="${BASE_URL}/">首頁</a>
            <a href="${BASE_URL}/about.html">關於</a>
        </nav>
    </header>
    <main>${content}</main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${config.title} | 最後更新: ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;
}

function build() {
    console.log('🔨 Building site...');
    const config = loadConfig();
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let posts = [];
    if (fs.existsSync(POSTS_DIR)) {
        const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort().reverse();
        for (const file of files) {
            const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
            const parsed = frontMatter(content);
            posts.push({
                file,
                url: `${BASE_URL}/posts/${file.replace('.md', '.html')}`,
                attributes: parsed.attributes,
                body: parsed.body
            });
        }
    }

    // Index
    let listHtml = '<h2>最新文章</h2><ul>';
    posts.forEach(p => {
        listHtml += `<li><a href="${p.url}">${p.attributes.title}</a> <span class="date">(${new Date(p.attributes.date).toLocaleDateString()})</span></li>`;
    });
    listHtml += '</ul>';
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), createHtmlTemplate('首頁', listHtml, config));

    // Posts
    const postsDir = path.join(OUTPUT_DIR, 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    posts.forEach(p => {
        const postHtml = `<article><h1>${p.attributes.title}</h1><div class="date">${new Date(p.attributes.date).toLocaleString()}</div><hr>${marked(p.body)}</article>`;
        fs.writeFileSync(path.join(postsDir, p.file.replace('.md', '.html')), createHtmlTemplate(p.attributes.title, postHtml, config));
    });

    // About
    fs.writeFileSync(path.join(OUTPUT_DIR, 'about.html'), createHtmlTemplate('關於', '<h2>關於本站</h2><p>這是一個自動抓取 AI 新聞的 Blog。</p>', config));
    
    console.log('✅ Done!');
}

build();
