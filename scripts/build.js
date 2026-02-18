#!/usr/bin/env node
/**
 * 靜態網站生成器
 * 將 Markdown 文章轉換為 HTML
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const OUTPUT_DIR = path.join(BLOG_ROOT, '_site');
const CONFIG_FILE = path.join(BLOG_ROOT, 'config.json');

// 載入設定
function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    return {
        title: 'AI 每日新聞',
        description: '每天自動更新的 AI 領域最新資訊',
        url: '',
        author: 'AI News Bot'
    };
}

// HTML 模板
function createHtmlTemplate(title, content, config, isHome = false) {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${config.title}</title>
    <meta name="description" content="${config.description}">
    <style>
        :root {
            --primary: #2563eb;
            --text: #1f2937;
            --text-light: #6b7280;
            --bg: #ffffff;
            --bg-alt: #f3f4f6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--bg);
        }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        header {
            background: var(--bg-alt);
            padding: 2rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        header p { color: var(--text-light); }
        nav { margin-top: 1rem; }
        nav a { color: var(--primary); text-decoration: none; margin-right: 1rem; }
        nav a:hover { text-decoration: underline; }
        main { padding: 2rem 0; }
        article { margin-bottom: 3rem; }
        article h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
        article .meta { color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem; }
        article h2 { font-size: 1.4rem; margin: 1.5rem 0 0.5rem; }
        article h3 { font-size: 1.2rem; margin: 1rem 0 0.5rem; }
        article p { margin-bottom: 1rem; }
        article ul, article ol { margin: 1rem 0; padding-left: 2rem; }
        article li { margin-bottom: 0.5rem; }
        article a { color: var(--primary); }
        article blockquote {
            border-left: 4px solid var(--primary);
            padding-left: 1rem;
            margin: 1rem 0;
            color: var(--text-light);
        }
        article code {
            background: var(--bg-alt);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: "Fira Code", monospace;
            font-size: 0.9em;
        }
        article pre {
            background: var(--bg-alt);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
        }
        article pre code { background: none; padding: 0; }
        footer {
            border-top: 1px solid #e5e7eb;
            padding: 2rem 0;
            text-align: center;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        .post-list { list-style: none; }
        .post-list li {
            padding: 1rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .post-list h2 { margin: 0; font-size: 1.3rem; }
        .post-list h2 a { color: var(--text); text-decoration: none; }
        .post-list h2 a:hover { color: var(--primary); }
        .post-list .date { color: var(--text-light); font-size: 0.85rem; }
        .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .tag {
            background: var(--bg-alt);
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            font-size: 0.8rem;
            color: var(--text-light);
        }
        @media (max-width: 600px) {
            .container { padding: 1rem; }
            header h1 { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1><a href="/" style="text-decoration: none; color: inherit;">🤖 ${config.title}</a></h1>
            <p>${config.description}</p>
            <nav>
                <a href="/">首頁</a>
                <a href="/about.html">關於</a>
                <a href="https://github.com/your-username/ai-news-blog" target="_blank">GitHub</a>
            </nav>
        </div>
    </header>

    <main class="container">
        ${content}
    </main>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${config.title}. Built with Node.js</p>
            <p>最後更新：${new Date().toLocaleString('zh-TW')}</p>
        </div>
    </footer>
</body>
</html>`;
}

// 轉換 Markdown 為 HTML
function convertMarkdownToHtml(mdContent) {
    return marked(mdContent);
}

// 建立文章列表
function buildPostList(posts, config) {
    let html = '<ul class="post-list">\n';
    
    posts.forEach(post => {
        const date = new Date(post.attributes.date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        html += `        <li>
            <h2><a href="${post.url}">${post.attributes.title}</a></h2>
            <p class="date">${date}</p>
            ${post.attributes.summary ? `<p>${post.attributes.summary}</p>` : ''}
        </li>\n`;
    });
    
    html += '    </ul>';
    return html;
}

// 主建函式
function build() {
    console.log('🔨 開始建立網站...');
    
    const config = loadConfig();
    
    // 確保輸出目錄存在
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // 讀取所有文章
    let posts = [];
    if (fs.existsSync(POSTS_DIR)) {
        const files = fs.readdirSync(POSTS_DIR)
            .filter(f => f.endsWith('.md'))
            .sort()
            .reverse();
        
        for (const file of files) {
            const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
            const parsed = frontMatter(content);
            posts.push({
                file,
                url: `/posts/${file.replace('.md', '.html')}`,
                attributes: parsed.attributes,
                body: parsed.body
            });
        }
    }
    
    console.log(`  找到 ${posts.length} 篇文章`);
    
    // 建立首頁
    console.log('  → 建立首頁...');
    const homeContent = `
        <section>
            <h2>📰 最新文章</h2>
            ${posts.length > 0 ? buildPostList(posts.slice(0, 10), config) : '<p>暫無文章</p>'}
        </section>
        
        <section style="margin-top: 3rem; padding: 2rem; background: #f3f4f6; border-radius: 8px;">
            <h3>關於本網站</h3>
            <p>本網站每日自動抓取各大技術社群的 AI 相關新聞，包括：</p>
            <ul style="margin: 1rem 0;">
                <li>🔹 Hacker News - 技術社群熱門討論</li>
                <li>🔹 Reddit r/MachineLearning - ML 研究與應用</li>
            </ul>
            <p style="margin-top: 1rem;">使用 Node.js 靜態生成，部署於 GitHub Pages。</p>
        </section>
    `;
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'index.html'),
        createHtmlTemplate('首頁', homeContent, config, true)
    );
    
    // 建立文章頁面
    console.log('  → 建立文章頁面...');
    const postsOutputDir = path.join(OUTPUT_DIR, 'posts');
    if (!fs.existsSync(postsOutputDir)) {
        fs.mkdirSync(postsOutputDir, { recursive: true });
    }
    
    for (const post of posts) {
        const htmlContent = convertMarkdownToHtml(post.body);
        const fullHtml = createHtmlTemplate(
            post.attributes.title,
            `<article>${htmlContent}</article>`,
            config
        );
        
        const outputFile = post.file.replace('.md', '.html');
        fs.writeFileSync(path.join(postsOutputDir, outputFile), fullHtml);
    }
    
    // 建立關於頁面
    console.log('  → 建立關於頁面...');
    const aboutContent = `
        <article>
            <h1>關於 AI 每日新聞</h1>
            <p>這是一個自動化 AI 新聞聚合網站，每日從各大技術社群抓取 AI 相關的新聞和討論。</p>
            
            <h2>技術棧</h2>
            <ul>
                <li><strong>Node.js</strong> - 後端運行時</li>
                <li><strong>marked</strong> - Markdown 解析器</li>
                <li><strong>axios</strong> - HTTP 請求</li>
                <li><strong>simple-git</strong> - Git 自動化</li>
                <li><strong>GitHub Pages</strong> - 免費靜態網站託管</li>
            </ul>
            
            <h2>資料來源</h2>
            <ul>
                <li>Hacker News API</li>
                <li>Reddit API (r/MachineLearning)</li>
            </ul>
            
            <h2>原始碼</h2>
            <p>本站完全開源，歡迎參考或 Fork：</p>
            <p><a href="https://github.com/your-username/ai-news-blog" target="_blank">GitHub Repository</a></p>
        </article>
    `;
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'about.html'),
        createHtmlTemplate('關於', aboutContent, config)
    );
    
    // 複製 assets（如果有）
    const assetsDir = path.join(BLOG_ROOT, 'assets');
    if (fs.existsSync(assetsDir)) {
        console.log('  → 複製資源檔...');
        fs.cpSync(assetsDir, path.join(OUTPUT_DIR, 'assets'), { recursive: true });
    }
    
    console.log('✅ 網站建立完成！');
    console.log(`   輸出目錄：${OUTPUT_DIR}`);
    console.log(`   文章數量：${posts.length}`);
}

// 執行
build();
