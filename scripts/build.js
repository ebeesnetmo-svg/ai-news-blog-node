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
    return { title: 'AI INSIGHTS', description: '探索人工智慧的最前線' };
}

function createHtmlTemplate(title, content, config) {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${config.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --glass: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(255, 255, 255, 0.3);
            --primary: #6366f1;
            --secondary: #a855f7;
            --text: #1e293b;
            --bg: #f8fafc;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: var(--text);
            line-height: 1.7;
            min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        
        header { 
            text-align: center; 
            margin-bottom: 60px;
            padding: 40px;
            background: var(--glass);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
        }
        .logo {
            font-weight: 800;
            font-size: 2.5rem;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1px;
            margin-bottom: 10px;
        }
        nav { margin-top: 20px; }
        nav a { 
            text-decoration: none; 
            color: var(--text); 
            font-weight: 600; 
            margin: 0 15px; 
            opacity: 0.7;
            transition: 0.3s;
        }
        nav a:hover { opacity: 1; color: var(--primary); }

        article.card {
            background: var(--glass);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 24px;
            border: 1px solid var(--glass-border);
            margin-bottom: 30px;
            transition: transform 0.3s ease;
        }
        article.card:hover { transform: translateY(-5px); }
        
        h2.post-title a {
            text-decoration: none;
            color: var(--text);
            font-weight: 700;
        }
        .meta { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            border-radius: 99px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 15px;
        }

        .content h1, .content h2, .content h3 { margin: 1.5rem 0 1rem; font-weight: 700; }
        .content p { margin-bottom: 1.2rem; }
        .content a { color: var(--primary); font-weight: 600; }
        
        footer { 
            text-align: center; 
            margin-top: 80px; 
            padding-bottom: 40px;
            font-size: 0.9rem;
            color: #94a3b8;
        }

        ul.post-list { list-style: none; }
        ul.post-list li { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">AI INSIGHTS</div>
            <p>探索人工智慧的最前線 • 每日專業快報</p>
            <nav>
                <a href="${BASE_URL}/">最新快報</a>
                <a href="${BASE_URL}/about.html">關於頻道</a>
            </nav>
        </header>
        <main>${content}</main>
        <footer>
            <p>&copy; ${new Date().getFullYear()} AI INSIGHTS NETWORK. 系統自動化播報中</p>
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

    // Index Page
    let indexHtml = '<ul class="post-list">';
    posts.forEach(p => {
        indexHtml += `
        <li>
            <article class="card">
                <div class="badge">DAILY REPORT</div>
                <h2 class="post-title"><a href="${p.url}">${p.attributes.title}</a></h2>
                <div class="meta">${new Date(p.attributes.date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <p>${p.attributes.summary || '點擊閱讀今日 AI 產業重要動態整理...'}</p>
            </article>
        </li>`;
    });
    indexHtml += '</ul>';
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), createHtmlTemplate('首頁', indexHtml, config));

    // Post Pages
    const postsDir = path.join(OUTPUT_DIR, 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    posts.forEach(p => {
        const postHtml = `
        <article class="card">
            <div class="badge">NEWS FLASH</div>
            <h1>${p.attributes.title}</h1>
            <div class="meta">發布時間：${new Date(p.attributes.date).toLocaleString()}</div>
            <div class="content">${marked(p.body)}</div>
        </article>`;
        fs.writeFileSync(path.join(postsDir, p.file.replace('.md', '.html')), createHtmlTemplate(p.attributes.title, postHtml, config));
    });

    // About Page
    const aboutContent = `
    <article class="card">
        <h1>關於 AI INSIGHTS</h1>
        <p>AI INSIGHTS 是一個專注於人工智慧領域的新聞頻道。我們透過自動化技術，每日監測全球技術社群與新聞來源，為您提煉最具價值的情報。</p>
        <p>這不是一個普通的 Blog，而是一個基於 Web 3.0 美學打造的自動化資訊引擎。</p>
    </article>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'about.html'), createHtmlTemplate('關於頻道', aboutContent, config));
    
    console.log('✅ Web 3.0 Site Built Successfully!');
}
build();
