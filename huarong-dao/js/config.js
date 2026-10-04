/*
 * 尋光之旅 — 可修改設定（文字、圖片、關卡、時限、管理密碼都在這裏）
 *
 * 更換圖片：把新圖片放進 assets/ 資料夾，再把下面的路徑改成新檔名；
 *           或者直接用同名檔案覆蓋。PNG、JPG、WebP、SVG 均可。
 * 圖片比例：小羊 1:1、樹（直）1:2、木頭（橫）2:1、石頭 1:1、背景 4:3 橫向。
 *           詳細尺寸見 README.md。
 *
 * 關卡佈局：5 行 × 4 格，由上至下。
 *   B = 小羊（2×2，必須剛好一隻）  V = 樹（直，1×2）
 *   H = 木頭（橫，2×1）            S = 石頭（1×1）     . = 空位
 *   小羊移到底部中間的出口即過關。改動佈局後，請執行 tests 確認有解。
 */
window.GAME_CONFIG = {
  title: '尋光之旅',
  subtitle: '華容道挑戰 · 共三關',
  story: '迷途的小羊在黑夜裏找不到路。請移開樹木、木頭和石頭，帶領小羊從底部的出口走向光明。',
  howTo: [
    '用手指拖動方塊；方塊只可向一邊移動時，輕按一下也可以。',
    '把發光的小羊移到底部的出口，就可過關。',
    '三關全部完成，即可登上龍虎榜。',
  ],

  levels: [
    {
      name: '第一關',
      title: '黑夜',
      layout: ['SBBS', 'SBBS', '....', 'V..V', 'VHHV'], // 最少 7 步
      timeLimit: 240, // 秒；管理頁可另行調整
      background: 'assets/bg-level1.svg',
      verse: { text: '你的話是我腳前的燈，是我路上的光。', ref: '詩篇 119:105' },
    },
    {
      name: '第二關',
      title: '破曉',
      layout: ['VBBV', 'VBBV', 'VSSV', 'VHHV', '....'], // 最少 12 步
      timeLimit: 300,
      background: 'assets/bg-level2.svg',
      verse: { text: '耶和華是我的亮光，是我的拯救，我還怕誰呢？', ref: '詩篇 27:1' },
    },
    {
      name: '第三關',
      title: '晨光',
      layout: ['VSSV', 'VBBV', 'VBBV', 'VSSV', '.HH.'], // 最少 22 步
      timeLimit: 360,
      background: 'assets/bg-level3.svg',
      verse: { text: '我是世界的光。跟從我的，就不在黑暗裡走，必要得著生命的光。', ref: '約翰福音 8:12' },
    },
  ],

  images: {
    home: 'assets/bg-home.svg',
    board: 'assets/board.svg',
    exit: 'assets/exit.svg',
    // 個別關卡可在 levels 內加 pieces: { V: 'assets/另一款樹.png' } 覆蓋
    pieces: {
      B: 'assets/lamb.svg',
      V: 'assets/tree.svg',
      H: 'assets/log.svg',
      S: 'assets/rock.svg',
    },
  },

  leaderboardSize: 10, // 龍虎榜顯示名次
  nameMaxLength: 8, // 暱稱字數上限
  adminPin: '2468', // 管理頁密碼：在主頁長按標題 2 秒進入
  idleSeconds: 120, // 無人操作多久彈出「仍在玩嗎？」
  idleCountdownSeconds: 15, // 提示後多久返回主頁
  resultAutoReturnSeconds: 30, // 上榜後多久自動返回主頁
};
