#!/usr/bin/env bash
# 重新製作標題字型（思源宋體 Noto Serif HK 的子集）。
# 修改 config.js 或畫面文字後執行，確保新增的字都有宋體字形；不執行的話，新字會用系統字型顯示。
# 用法：bash tools/update-fonts.sh   （需要網絡、curl 及 node）
set -euo pipefail
cd "$(dirname "$0")/.."

TEXT=$(node -e "
const fs = require('fs');
const src = ['index.html', 'js/app.js', 'js/config.js'].map(f => fs.readFileSync(f, 'utf8')).join('');
const set = new Set([...src].filter(c => c.codePointAt(0) > 0x2e7f));
for (const c of '0123456789:.!?,·「」（）—+- ') set.add(c);
process.stdout.write(encodeURIComponent([...set].sort().join('')));
")
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

for WEIGHT in 600 900; do
  CSS=$(curl -sS --fail -A "$UA" "https://fonts.googleapis.com/css2?family=Noto+Serif+HK:wght@${WEIGHT}&text=${TEXT}")
  URL=$(printf '%s' "$CSS" | grep -o 'https://fonts.gstatic.com/[^)]*' | head -1)
  if [ -z "$URL" ]; then echo "找不到字型網址（字重 ${WEIGHT}）" >&2; exit 1; fi
  curl -sS --fail -A "$UA" -o "fonts/serif-${WEIGHT}.woff2" "$URL"
  echo "fonts/serif-${WEIGHT}.woff2 $(wc -c < "fonts/serif-${WEIGHT}.woff2") bytes"
done
