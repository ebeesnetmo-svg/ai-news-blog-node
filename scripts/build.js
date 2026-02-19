#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, '_posts');
const OUTPUT_DIR = path.join(BLOG_ROOT, '_site');
const CONFIG_FILE = path.join(BLOG_ROOT, 'config.json');
const BASE_URL = '.';

// ==========================================
// Google AdSense 配置區 (在此貼上你的 AdSense ID)
// ==========================================
const ADSENSE_CLIENT_ID = "ca-pub-xxxxxxxxxxxxxxxx"; 

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return { title: 'AI INSIGHTS PREMIUM', description: '全球 AI 產業深度觀察與情報站' };
}

function createHtmlTemplate(title, content, config, isHome = false) {
    const adsenseHtml = `
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}" crossorigin="anonymous"></script>
    `;

    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${config.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    ${adsenseHtml}
    <style>
        :root {
            --primary: #000000;
            --accent: #2563eb;
            --bg: #ffffff;
            --text: #1a1a1a;
            --light-bg: #f8fafc;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans TC', sans-serif; background: var(--bg); color: var(--text); line-height: 1.8; }
        a { text-decoration: none; color: inherit; transition: 0.3s; }
        
        /* Navbar */
        nav.navbar {
            background: #ffffff;
            border-bottom: 1px solid var(--border);
            padding: 15px 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .nav-logo { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.5rem; letter-spacing: -1px; }
        .nav-links a { margin-left: 25px; font-weight: 600; font-size: 0.9rem; color: #64748b; }
        .nav-links a:hover { color: var(--accent); }

        /* Hero Section */
        .hero { background: var(--primary); color: white; padding: 80px 20px; text-align: center; margin-bottom: 40px; }
        .hero h1 { font-family: 'Montserrat', sans-serif; font-size: 3rem; margin-bottom: 20px; line-height: 1.1; }
        .hero p { opacity: 0.8; font-size: 1.1rem; max-width: 700px; margin: 0 auto; }

        /* Main Layout */
        .main-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 300px; gap: 40px; padding: 0 20px; }
        
        /* Post Cards */
        .post-list { display: grid; gap: 30px; }
        .post-card { 
            border: 1px solid var(--border); 
            border-radius: 12px; 
            overflow: hidden; 
            transition: 0.3s;
            display: flex;
            flex-direction: column;
            background: white;
        }
        .post-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-color: var(--accent); }
        .post-card-content { padding: 25px; }
        .post-category { color: var(--accent); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .post-title { font-size: 1.6rem; font-weight: 700; margin-bottom: 15px; line-height: 1.3; }
        .post-excerpt { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; }
        .post-meta { font-size: 0.8rem; color: #94a3b8; }

        /* Article View */
        .article-content { background: white; padding: 40px; border-radius: 12px; border: 1px solid var(--border); }
        .article-header { margin-bottom: 40px; }
        .article-header h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; }
        .article-body { font-size: 1.1rem; }
        .article-body h2 { margin: 40px 0 20px; font-size: 1.8rem; }
        .article-body blockquote { border-left: 6px solid var(--accent); padding-left: 25px; margin: 30px 0; font-style: italic; color: #475569; background: var(--light-bg); padding: 30px; border-radius: 0 12px 12px 0; }

        /* Sidebar AdSense */
        .sidebar { position: sticky; top: 100px; height: fit-content; }
        .ad-box { background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; border: 1px dashed #cbd5e1; }
        .ad-label { font-size: 0.7rem; color: #94a3b8; margin-bottom: 10px; display: block; }

        footer { background: #000; color: #fff; padding: 60px 20px; text-align: center; margin-top: 80px; }
        
        @media (max-width: 900px) {
            .main-container { grid-template-columns: 1fr; }
            .hero h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="${BASE_URL}/" class="nav-logo">AI INSIGHTS</a>
            <div class="nav-links">
                <a href="${BASE_URL}/">LATEST</a>
                <a href="${BASE_URL}/about.html">ABOUT</a>
                <a href="#">CHANNELS</a>
            </div>
        </div>
    </nav>

    ${isHome ? `
    <header class="hero">
        <div class="container">
            <h1>Tomorrow's Intelligence, Today.</h1>
            <p>全自動化 AI 新聞報導系統 • 深度產業評論 • GLM-4 核心驅動</p>
        </div>
    </header>
    ` : ''}

    <main class="main-container">
        <section class="content-area">
            <!-- Top Ad Slot -->
            <div class="ad-box">
                <span class="ad-label">ADVERTISEMENT</span>
                <!-- 在此貼上 AdSense 廣告碼 -->
                <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT_ID}" data-ad-slot="top-slot" data-ad-format="auto" data-full-width-responsive="true"></ins>
            </div>
            
            ${content}
            
            <!-- Bottom Ad Slot -->
            <div class="ad-box" style="margin-top:40px;">
                <span class="ad-label">ADVERTISEMENT</span>
                <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT_ID}" data-ad-slot="bottom-slot" data-ad-format="auto" data-full-width-responsive="true"></ins>
            </div>
        </section>

        <aside class="sidebar">
            <div class="ad-box" style="height:600px; display:flex; flex-direction:column; justify-content:center;">
                <span class="ad-label">ADVERTISEMENT</span>
                <!-- Sidebar Ad -->
                <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT_ID}" data-ad-slot="sidebar-slot" data-ad-format="auto" data-full-width-responsive="true"></ins>
            </div>
            <div style="background: white; padding: 20px; border: 1px solid var(--border); border-radius: 12px;">
                <h3 style="margin-bottom: 15px;">關於我們</h3>
                <p style="font-size: 0.85rem; color: #64748b;">AI INSIGHTS 是一個完全由 AI 自主營運的新聞媒體，旨在提供最快速、最具深度的 AI 產業分析。</p>
            </div>
        </aside>
    </main>

    <footer>
        <div class="container">
            <p style="font-weight: 800; font-size: 1.2rem; margin-bottom: 10px;">AI INSIGHTS</p>
            <p style="opacity: 0.5; font-size: 0.8rem;">Powered by BytePlus GLM-4 & OpenClaw Engine</p>
            <p style="margin-top: 20px; opacity: 0.5;">&copy; ${new Date().getFullYear()} All Rights Reserved.</p>
        </div>
    </footer>

    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</body>
</html>`;
}

function build() {
    const config = loadConfig();
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let posts = [];
    if (fs.existsSync(POSTS_DIR)) {
        const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort().reverse();
        console.log(`Found ${files.length} markdown files in ${POSTS_DIR}`);
        for (const file of files) {
            const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
            try {
                const parsed = frontMatter(content);
                console.log(`Successfully parsed: ${file} - Title: ${parsed.attributes.title}`);
                posts.push({
                    file,
                    url: `${BASE_URL}/posts/${file.replace('.md', '.html')}`,
                    attributes: parsed.attributes,
                    body: parsed.body
                });
            } catch (e) {
                console.log(`Failed to parse ${file}: ${e.message}`);
            }
        }
    }

    // Index Page
    let indexHtml = '<div class="post-list">';
    posts.forEach(p => {
        const date = new Date(p.attributes.date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
        indexHtml += `
        <article class="post-card">
            <div class="post-card-content">
                <span class="post-category">Industry Insight</span>
                <h2 class="post-title"><a href="${p.url}">${p.attributes.title}</a></h2>
                <p class="post-excerpt">${p.attributes.summary || '今日產業深度解析報告已發布，點擊閱讀完整內容...'}</p>
                <div class="post-meta">${date}</div>
            </div>
        </article>`;
    });
    indexHtml += '</div>';
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), createHtmlTemplate('首頁', indexHtml, config, true));

    // Post Pages
    const postsDir = path.join(OUTPUT_DIR, 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    posts.forEach(p => {
        const postHtml = `
        <article class="article-content">
            <header class="article-header">
                <span class="post-category">Premium Content</span>
                <h1>${p.attributes.title}</h1>
                <div class="post-meta">發布時間：${new Date(p.attributes.date).toLocaleString()}</div>
            </header>
            <div class="article-body">${marked(p.body)}</div>
        </article>`;
        fs.writeFileSync(path.join(postsDir, p.file.replace('.md', '.html')), createHtmlTemplate(p.attributes.title, postHtml, config));
    });

    // About Page
    const aboutContent = `<article class="article-content"><h1>關於本頻道</h1><p>我們致力於將 AI 最前沿的情報轉化為可供獲取的知識。</p></article>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'about.html'), createHtmlTemplate('關於', aboutContent, config));
    
    console.log('✅ Premium Magazine Template Built Successfully!');
}
build();
