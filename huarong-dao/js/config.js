/*
 * 尋光之旅 — 可修改設定（文字、圖片、關卡、時限、管理密碼都在這裏）
 *
 * 規則：方塊只可沿長邊方向移動（直放上下、橫放左右）；把小羊（X）移到底部出口即過關。
 *
 * 關卡佈局：board.rows 行 × board.cols 格，由上至下。
 *   同一個英文字母代表同一件方塊（長 2 或 3 格，一條直線），「.」為空位。
 *   X = 小羊，必須直放在出口那一欄（board.exitCol，由 0 起計）。
 *   改動佈局後，請執行 tests 確認有解及最少步數。
 *
 * 更換圖片：把新圖片放進 assets/，再把下面的路徑改成新檔名（或用同名檔案覆蓋）。
 *   方塊圖片按形狀：X 小羊（直 1:2）、V2 直 1:2、H2 橫 2:1、V3 直 1:3、H3 橫 3:1。
 *   想個別方塊用不同圖片，可在該關加 pieces: { A: 'assets/xxx.png' }（以字母指定）。
 *   詳細尺寸見 README.md。
 */
window.GAME_CONFIG = {
  title: '尋光之旅',
  subtitle: '華容道挑戰 · 共三關',
  story: '迷途的小羊被困在擠擁的山路上。請移開樹木、木頭和木車，帶領小羊從底部的出口走向光明。',
  howTo: [
    '直放的方塊只可上下移動，橫放的方塊只可左右移動。',
    '用手指拖動方塊；或輕按方塊的一端，方塊會向那邊移一格。',
    '把發光的小羊移到底部出口就過關；完成三關即可登上龍虎榜。',
  ],

  board: { cols: 6, rows: 6, exitCol: 3 },

  levels: [
    {
      name: '第一關',
      title: '微光',
      // 參考書中第 011 題，最少 6 步
      layout: [
        '.B....',
        '.B....',
        '.B.XCC',
        '...X.D',
        '.EEFFD',
        '......',
      ],
      timeLimit: 240, // 秒；管理頁可另行調整
      background: 'assets/bg-level1.svg',
      verse: { text: '你的話是我腳前的燈，是我路上的光。', ref: '詩篇 119:105' },
    },
    {
      name: '第二關',
      title: '曙光',
      // 參考書中第 099 題，最少 17 步
      layout: [
        'AABX..',
        '.CBXDD',
        '.CEEFF',
        '.GGGH.',
        '.II.H.',
        '...JJJ',
      ],
      timeLimit: 360,
      background: 'assets/bg-level2.svg',
      verse: { text: '耶和華是我的亮光，是我的拯救，我還怕誰呢？', ref: '詩篇 27:1' },
    },
    {
      name: '第三關',
      title: '光明',
      // 參考書中第 166 題，最少 21 步
      layout: [
        'AA.XBB',
        'CDDX..',
        'C.GEEE',
        'FFG.HH',
        'I.G..J',
        'I.KKKJ',
      ],
      timeLimit: 480,
      background: 'assets/bg-level3.svg',
      verse: { text: '我是世界的光。跟從我的，就不在黑暗裡走，必要得著生命的光。', ref: '約翰福音 8:12' },
    },
  ],

  images: {
    home: 'assets/bg-home.svg',
    board: 'assets/board.svg',
    exit: 'assets/exit.svg',
    pieces: {
      X: 'assets/lamb.svg', // 小羊（直放 2 格）
      V2: 'assets/tree.svg', // 直放 2 格
      H2: 'assets/log.svg', // 橫放 2 格
      V3: 'assets/palm.svg', // 直放 3 格
      H3: 'assets/cart.svg', // 橫放 3 格
    },
  },

  leaderboardSize: 10, // 龍虎榜顯示名次
  nameMaxLength: 8, // 暱稱字數上限
  adminPin: '2468', // 管理頁密碼：在主頁長按標題 2 秒進入
  idleSeconds: 120, // 無人操作多久彈出「仍在玩嗎？」
  idleCountdownSeconds: 15, // 提示後多久返回主頁
  resultAutoReturnSeconds: 30, // 上榜後多久自動返回主頁
};
