# Blog One-Click Optimize & Deploy
Write-Host "🚀 Starting Blog Optimization..." -ForegroundColor Cyan

# 1. Build
Write-Host "📦 Building site..."
node scripts/build.js

# 2. Deploy to gh-pages
Write-Host "🌐 Deploying to GitHub Pages..."
git checkout -f gh-pages
git pull origin gh-pages
copy-item -Path "_site\*" -Destination "." -Recurse -Force
git add .
git commit -m "Auto-optimization: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin gh-pages
git checkout main

Write-Host "✅ Optimization Complete! Your blog is now live." -ForegroundColor Green
