#!/usr/bin/env node
/**
 * 本地開發伺服器
 */

const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

const BLOG_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(BLOG_ROOT, '_site');
const PORT = process.env.PORT || 4000;

const app = express();

// 靜態檔案服務
app.use(express.static(OUTPUT_DIR));

// 404 處理
app.use((req, res) => {
    res.status(404).sendFile(path.join(OUTPUT_DIR, 'index.html'));
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🌐 本地開發伺服器');
    console.log('='.repeat(50));
    console.log(`\n   網址：http://localhost:${PORT}`);
    console.log(`   目錄：${OUTPUT_DIR}\n`);
    console.log('按 Ctrl+C 停止伺服器');
    console.log('='.repeat(50));
});
