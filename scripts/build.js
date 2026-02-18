#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const OUTPUT_DIR = path.join(BLOG_ROOT, '_site');
const CONFIG_FILE = path.join(BLOG_ROOT, 'config.json');
const BASE_URL = '/ai-news-blog-node';

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return { title: 'AI BLOGGER', description: '拒絕搬運，深度思考' };
}

function createHtmlTemplate(title, content, config) {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${config.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --accent: #3b82f6;
            --text: #334155;
            --bg: #ffffff;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', 'Noto Serif TC', serif; 
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.8;
        }
        .container { max-width: 760px; margin: 0 auto; padding: 60px 20px; }
        header { border-bottom: 4px solid var(--primary); padding-bottom: 30px; margin-bottom: 50px; }
        .site-title { font-size: 2.5rem; font-weight: 700; color: var(--primary); letter-spacing: -1px; text-decoration: none; }
        .site-tagline { font-size: 1rem; color: #64748b; margin-top: 5px; }
        
        .post-card { margin-bottom: 60px; }
        .post-title { font-size: 1.8rem; font-weight: 700; color: var(--primary); margin-bottom: 15px; line-height: 1.3; }
        .post-title a { text-decoration: none; color: inherit; transition: 0.2s; }
        .post-title a:hover { color: var(--accent); }
        .post-meta { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; }
        
        .content blockquote {
            border-left: 5px solid var(--accent);
            padding: 20px;
            background: #f8fafc;
            margin: 30px 0;
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }
        .content h2 { margin: 40px 0 20px; font-size: 1.5rem; color: var(--primary); border-left: 8px solid var(--primary); padding-left: 15px; }
        .content p { margin-bottom: 20px; }
        
        footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="${BASE_URL}/" class="site-title">AI PERSPECTIVE</a>
            <div class="site-tagline">拒絕平庸搬運，提供專業 AI 產業主觀觀點</div>
        </header>
        <main>${content}</main>
        <footer>
            <p>&copy; ${new Date().getFullYear()} AI PERSPECTIVE - 由 OpenClaw 自動化引擎驅動</p>
        </footer>
    </div>
</body>
</html>`;
}

function build() {
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
    let listHtml = '';
    posts.forEach(p => {
        listHtml += `
        <div class="post-card">
            <div class="post-meta">${new Date(p.attributes.date).toLocaleDateString()}</div>
            <h2 class="post-title"><a href="${p.url}">${p.attributes.title}</a></h2>
            <p>${p.attributes.summary || ''}</p>
        </div>`;
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), createHtmlTemplate('首頁', listHtml, config));

    // Pages
    const postsDir = path.join(OUTPUT_DIR, 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    posts.forEach(p => {
        const postHtml = `
        <div class="content">
            <div class="post-meta">發布於 ${new Date(p.attributes.date).toLocaleString()}</div>
            ${marked(p.body)}
        </div>`;
        fs.writeFileSync(path.join(postsDir, p.file.replace('.md', '.html')), createHtmlTemplate(p.attributes.title, postHtml, config));
    });
}
build();
