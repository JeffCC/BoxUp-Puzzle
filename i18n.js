/* 共用的語系切換：中文 (zh) / 英文 (en)
 * - 以 navigator.language 自動判斷（zh 開頭用中文，其餘用英文）
 * - 使用者可按畫面上的語言按鈕手動切換，選擇存在 localStorage
 * - HTML 以 data-i18n / data-i18n-title / data-i18n-placeholder / data-i18n-aria 標註
 * - 動態字串用 I18N.t(key, vars)
 */
(function () {
  'use strict';
  const K_LANG = 'boxup.lang';

  const DICT = {
    zh: {
      // ---- 共用 ----
      lang_toggle_title: '切換語言 / Switch language',
      lang_toggle_label: 'EN',

      // ---- index.html 介面 ----
      page_title_game: 'Box Up 箱中箱',
      brand_sub_game: '箱中箱',
      btn_prev_title: '上一關',
      btn_next_title: '下一關',
      lvl_sel_aria: '選擇關卡',
      nav_editor: '✎ 關卡編輯器',
      btn_undo: '↶ 復原 (Z)',
      btn_restart: '⟲ 重新開始 (R)',
      btn_hint: '💡 提示一步 (H)',
      btn_play_solution: '▶ 播放最短解',
      btn_stop_play: '■ 停止播放',
      dpad_aria: '方向鍵',
      rules_summary: '遊戲規則',
      rule_1: '用方向鍵（或 WASD、畫面按鈕、點擊相鄰格、手機滑動）移動<b>小黑點</b>。',
      rule_2: '箱子是缺一邊的方框，<b>缺口</b>就是入口。只能從缺口走進箱子。',
      rule_3: '在箱子裡往缺口方向走會離開箱子;往其他方向走會<b>推著箱子一起移動</b>。',
      rule_4: '紅箱可以從藍箱的缺口推進藍箱;藍箱則放不進紅箱,箱子也不能撞進同色箱子。',
      rule_5: '目標:小黑點進入<span style="color:var(--box-red)">紅箱</span>,再把紅箱推進<span style="color:var(--box-blue)">藍箱</span>。黑色的箱子只是障礙用的配角。',
      rules_kbd: '鍵盤:方向鍵 / WASD 移動、Z 或 Backspace 復原、R 重新開始、H 提示。',
      stat_steps: '步數',
      stat_best: '個人最佳',
      stat_par: '最短解',
      movelog_h2: '移動紀錄',
      btn_copy: '複製',
      save_h2: '存檔',
      save_name_placeholder: '存檔名稱(可留空)',
      btn_save: '💾 存檔',
      btn_export_all: '⤓ 匯出全部 (JSON)',
      btn_import: '⤒ 匯入',
      autosave_h2: '過關自動存解法',
      autosave_checking: '檢查中…',
      autosave_toggle: '過關時自動存檔',
      btn_pick_dir: '📁 選擇 solution 資料夾',
      footer_credit: 'BoxUp 由 Andrea Gilbert 創作(<a href="https://clickmazes.com/boxup/new-boxup.htm" target="_blank" rel="noopener">clickmazes.com</a>)。內建 29 關來自三位作者:Andrea Gilbert(2003,12 關)、Don O\'Brien(2003,5 關)、Bob Henderson(2012,12 關),依原作者的 <a href="https://auroriax.github.io/PuzzleScript/play.html?p=192b7403618c6c10eccb83986283053b" target="_blank" rel="noopener">PuzzleScript 版</a>與 <a href="https://www.mansoft.nl/svg/boxup.html" target="_blank" rel="noopener">mansoft.nl</a> 版重現。關卡設計版權屬各作者。',

      // ---- index.html 動態 ----
      no_moves_yet: '尚未移動',
      status_bad_format: '關卡格式錯誤:{msg}',
      par_no_solution: '無解',
      par_too_big: '太大',
      hint_too_many: '狀態太多,無法計算',
      hint_no_solution_here: '目前局面無解,請復原或重新開始',
      hint_text: '提示:{arrow}(還需 {n} 步)',
      replay_done: '{label} 播放完畢',
      label_shortest: '最短解',
      level_no_solution: '此關無解',
      msg_solved: '🎉 過關!共 {n} 步',
      msg_solved_optimal: '(最短解!)',
      msg_playing: '▶ 播放中…',
      group_custom: '自訂關卡',
      test_level_default_name: '試玩關卡',
      toast_storage_fail: '無法寫入瀏覽器儲存空間',
      toast_no_moves: '還沒有任何移動可存檔',
      toast_saved: '已存檔',
      no_saves: '尚無存檔。存檔會保存在這個瀏覽器中,可匯出成 JSON 備份。',
      record_default_name: '{level} - {n} 步',
      badge_solved: '已過關',
      badge_in_progress: '進行中',
      btn_load_continue: '載入繼續',
      btn_replay: '▶ 重播',
      btn_dl_txt: '⤓ .txt',
      btn_delete: '刪除',
      confirm_delete_save: '刪除存檔「{name}」?',
      toast_loaded: '已載入:{name}',
      toast_copied: '已複製移動紀錄',
      toast_copy_failed: '複製失敗',
      autosave_server: '✔ 已連線本機伺服器:過關後自動存到專案的 solution/ 目錄,檔名為「關卡名稱_步數.txt」。',
      autosave_dir: '✔ 存到你選的資料夾「{name}」,檔名為「關卡名稱_步數.txt」。',
      autosave_download_pick: '目前以瀏覽器下載方式存檔。若要直接存進 solution/ 目錄,請用 python server.py 啟動,或按下方按鈕選擇 solution 資料夾。',
      autosave_download_only: '目前以瀏覽器下載方式存檔。若要直接存進 solution/ 目錄,請用 python server.py 啟動。',
      toast_sol_saved: '已存解法:{file}',
      toast_sol_saved_dir: '已存解法:{dir}/{filename}',
      toast_autosave_failed: '自動存檔失敗,改用下載:{msg}',
      toast_dir_set: '已設定存檔資料夾:{name}',
      toast_imported: '匯入 {n} 筆存檔',
      toast_imported_both: '匯入 {n} 筆存檔、{m} 個自訂關卡',
      toast_import_failed: '匯入失敗:檔案格式錯誤',
      // 存檔文字檔
      rec_txt_header: 'Box Up 遊戲紀錄',
      rec_txt_name: '名稱',
      rec_txt_level: '關卡',
      rec_txt_code: '關卡代碼',
      rec_txt_steps: '步數',
      rec_txt_status: '狀態',
      rec_txt_solved: '已過關',
      rec_txt_unfinished: '進行中',
      rec_txt_time: '時間',
      rec_txt_moves_urdl: '移動(URDL)',
      rec_txt_moves_arrows: '移動(方向)',
      rec_default_won_name: '{level} 過關',

      // ---- editor.html 介面 ----
      page_title_editor: 'Box Up 關卡編輯器',
      brand_sub_editor: '關卡編輯器',
      nav_game: '▶ 回到遊戲',
      lbl_width: '寬',
      lbl_height: '高',
      btn_resize: '調整大小',
      btn_clear: '清空',
      pb_first_title: '回到開頭 (Home)',
      pb_prev_title: '上一步 (←)',
      pb_play_title: '播放/暫停 (空白鍵)',
      pb_next_title: '下一步 (→)',
      pb_last_title: '跳到結尾 (End)',
      pb_play: '▶ 播放',
      pb_pause: '⏸ 暫停',
      pb_speed_title: '速度',
      pb_speed_slow: '慢',
      pb_speed_mid: '中',
      pb_speed_fast: '快',
      pb_exit_title: '結束示範 (Esc)',
      pb_exit: '✕ 結束示範',
      editor_tip: '左鍵:放置目前工具(可拖曳連續畫) · 右鍵:旋轉箱子開口(Shift+右鍵轉藍箱) · 在箱子上放玩家/紅箱可疊放 · 有星號 ★ 的紅箱/藍箱就是目標箱',
      code_h2: '關卡代碼',
      btn_load_code: '由代碼載入',
      btn_copy_code: '複製代碼',
      code_hint: '格式與原版相容,例:330121---;nMW;---',
      tools_h2: '工具',
      verify_h2: '檢查與存檔',
      name_placeholder: '關卡名稱',
      btn_verify: '🔍 驗證可解',
      btn_demo: '▶ 播放解法',
      btn_playtest: '🧪 試玩',
      btn_save_custom: '💾 存為自訂關卡',
      customs_h2: '我的自訂關卡',
      btn_export_customs: '⤓ 匯出 (JSON)',
      tpl_h2: '以內建關卡為範本',
      btn_tpl_load: '載入',

      // ---- editor.html 動態 ----
      tool_wall: '牆',
      tool_eraser: '橡皮擦',
      tool_player: '玩家',
      tool_target: '設為目標',
      tool_red_up: '紅·開上',
      tool_red_right: '紅·開右',
      tool_red_down: '紅·開下',
      tool_red_left: '紅·開左',
      tool_blue_up: '藍·開上',
      tool_blue_right: '藍·開右',
      tool_blue_down: '藍·開下',
      tool_blue_left: '藍·開左',
      msg_target_on_box: '「設為目標」要點在紅箱或藍箱上',
      msg_need_player: '請放置玩家(小黑點)',
      msg_need_red: '請放置至少一個紅箱',
      msg_need_blue: '請放置至少一個藍箱',
      msg_level_ok: '關卡格式正確',
      msg_level_warn: '⚠ {err}',
      no_customs: '尚無自訂關卡。自訂關卡會出現在遊戲頁的關卡選單「自訂關卡」分類中。',
      custom_par_suffix: '(最短 {n} 步)',
      btn_edit: '編輯',
      btn_play: '▶ 玩',
      confirm_delete_custom: '刪除自訂關卡「{name}」?',
      solve_calculating: '計算中…',
      solve_ok: '✔ 可解!最短 {n} 步(搜尋 {nodes} 個狀態)\n{arrows}',
      solve_too_many: '⚠ 狀態太多,無法在合理時間內判斷是否可解',
      solve_none: '✘ 此關卡無解',
      demo_unsolvable: '此關卡無解,無法示範',
      demo_done: '🎉 示範完成!',
      demo_start: '示範開始',
      demo_step: '第 {k} 步:{arrow}',
      step_counter: '{i} / {n}',
      custom_default_name: '自訂關卡 {date}',
      toast_dup: '已有相同的關卡:{name}',
      confirm_overwrite: '覆蓋原本的「{name}」?(取消則另存新關卡)',
      toast_custom_saved: '已儲存:{name}',
      confirm_clear_board: '清空整個棋盤?',
      toast_code_loaded: '已載入',
      toast_code_bad: '⚠ 代碼錯誤:{msg}',
      toast_copied_short: '已複製',
      tpl_edited_suffix: '(改)',
      playtest_default_name: '試玩關卡',
      import_custom_default_name: '匯入關卡',
      toast_imported_customs: '匯入 {n} 個關卡',
      file_save_customs: 'BoxUp-自訂關卡.json',
      file_save_all: 'BoxUp-存檔.json',
    },

    en: {
      lang_toggle_title: 'Switch language / 切換語言',
      lang_toggle_label: '中',

      page_title_game: 'Box Up',
      brand_sub_game: 'Box in Box',
      btn_prev_title: 'Previous level',
      btn_next_title: 'Next level',
      lvl_sel_aria: 'Select level',
      nav_editor: '✎ Level editor',
      btn_undo: '↶ Undo (Z)',
      btn_restart: '⟲ Restart (R)',
      btn_hint: '💡 Hint (H)',
      btn_play_solution: '▶ Play shortest solution',
      btn_stop_play: '■ Stop',
      dpad_aria: 'Directional pad',
      rules_summary: 'Rules',
      rule_1: 'Move the <b>player (black dot)</b> with arrow keys, WASD, the on-screen pad, by clicking an adjacent cell, or by swiping on touch devices.',
      rule_2: 'Each box has one side open — that <b>opening</b> is its entrance. You can only enter a box through its opening.',
      rule_3: 'Walking out through the opening leaves the box; walking any other direction <b>pushes the box with you</b>.',
      rule_4: 'A red box can be pushed into a blue box through the blue box\'s opening. A blue box can\'t enter a red box, and boxes can\'t collide with another box of the same color.',
      rule_5: 'Goal: get the player into the <span style="color:var(--box-red)">red box</span>, then push the red box into the <span style="color:var(--box-blue)">blue box</span>. Black boxes are just obstacles.',
      rules_kbd: 'Keyboard: Arrows / WASD to move, Z or Backspace to undo, R to restart, H for a hint.',
      stat_steps: 'Steps',
      stat_best: 'Personal best',
      stat_par: 'Shortest',
      movelog_h2: 'Move log',
      btn_copy: 'Copy',
      save_h2: 'Saves',
      save_name_placeholder: 'Save name (optional)',
      btn_save: '💾 Save',
      btn_export_all: '⤓ Export all (JSON)',
      btn_import: '⤒ Import',
      autosave_h2: 'Auto-save on win',
      autosave_checking: 'Checking…',
      autosave_toggle: 'Auto-save when solved',
      btn_pick_dir: '📁 Choose solution folder',
      footer_credit: 'BoxUp was created by Andrea Gilbert (<a href="https://clickmazes.com/boxup/new-boxup.htm" target="_blank" rel="noopener">clickmazes.com</a>). The 29 bundled levels come from three authors: Andrea Gilbert (2003, 12 levels), Don O\'Brien (2003, 5 levels), and Bob Henderson (2012, 12 levels), reproduced from the authors\' <a href="https://auroriax.github.io/PuzzleScript/play.html?p=192b7403618c6c10eccb83986283053b" target="_blank" rel="noopener">PuzzleScript edition</a> and <a href="https://www.mansoft.nl/svg/boxup.html" target="_blank" rel="noopener">mansoft.nl</a>. Level designs © their respective authors.',

      no_moves_yet: 'No moves yet',
      status_bad_format: 'Level format error: {msg}',
      par_no_solution: 'No solution',
      par_too_big: 'Too large',
      hint_too_many: 'Too many states — can\'t compute',
      hint_no_solution_here: 'No solution from here — undo or restart',
      hint_text: 'Hint: {arrow} ({n} steps left)',
      replay_done: '{label} playback finished',
      label_shortest: 'Shortest solution',
      level_no_solution: 'This level has no solution',
      msg_solved: '🎉 Solved! {n} steps',
      msg_solved_optimal: ' (optimal!)',
      msg_playing: '▶ Playing…',
      group_custom: 'Custom levels',
      test_level_default_name: 'Test level',
      toast_storage_fail: 'Cannot write to browser storage',
      toast_no_moves: 'No moves to save yet',
      toast_saved: 'Saved',
      no_saves: 'No saves yet. Saves live in this browser; export JSON to back up.',
      record_default_name: '{level} — {n} steps',
      badge_solved: 'Solved',
      badge_in_progress: 'In progress',
      btn_load_continue: 'Load & continue',
      btn_replay: '▶ Replay',
      btn_dl_txt: '⤓ .txt',
      btn_delete: 'Delete',
      confirm_delete_save: 'Delete save "{name}"?',
      toast_loaded: 'Loaded: {name}',
      toast_copied: 'Move log copied',
      toast_copy_failed: 'Copy failed',
      autosave_server: '✔ Local server connected: solutions auto-save to the project\'s solution/ folder as "LevelName_Steps.txt".',
      autosave_dir: '✔ Saving to your chosen folder "{name}" as "LevelName_Steps.txt".',
      autosave_download_pick: 'Currently saving via browser download. To write directly to solution/, launch python server.py, or click the button below to pick a solution folder.',
      autosave_download_only: 'Currently saving via browser download. To write directly to solution/, launch python server.py.',
      toast_sol_saved: 'Solution saved: {file}',
      toast_sol_saved_dir: 'Solution saved: {dir}/{filename}',
      toast_autosave_failed: 'Auto-save failed, falling back to download: {msg}',
      toast_dir_set: 'Save folder set: {name}',
      toast_imported: 'Imported {n} save(s)',
      toast_imported_both: 'Imported {n} save(s) and {m} custom level(s)',
      toast_import_failed: 'Import failed: bad file format',
      rec_txt_header: 'Box Up game record',
      rec_txt_name: 'Name',
      rec_txt_level: 'Level',
      rec_txt_code: 'Level code',
      rec_txt_steps: 'Steps',
      rec_txt_status: 'Status',
      rec_txt_solved: 'Solved',
      rec_txt_unfinished: 'In progress',
      rec_txt_time: 'Time',
      rec_txt_moves_urdl: 'Moves (URDL)',
      rec_txt_moves_arrows: 'Moves (arrows)',
      rec_default_won_name: '{level} solved',

      page_title_editor: 'Box Up Level Editor',
      brand_sub_editor: 'Level Editor',
      nav_game: '▶ Back to game',
      lbl_width: 'W',
      lbl_height: 'H',
      btn_resize: 'Resize',
      btn_clear: 'Clear',
      pb_first_title: 'Jump to start (Home)',
      pb_prev_title: 'Previous step (←)',
      pb_play_title: 'Play/Pause (Space)',
      pb_next_title: 'Next step (→)',
      pb_last_title: 'Jump to end (End)',
      pb_play: '▶ Play',
      pb_pause: '⏸ Pause',
      pb_speed_title: 'Speed',
      pb_speed_slow: 'Slow',
      pb_speed_mid: 'Medium',
      pb_speed_fast: 'Fast',
      pb_exit_title: 'Exit demo (Esc)',
      pb_exit: '✕ Exit demo',
      editor_tip: 'Left click: place current tool (drag to paint). Right click: rotate box opening (Shift+right-click for blue). Players/red boxes can stack onto boxes. Red/blue boxes with a ★ are the goal boxes.',
      code_h2: 'Level code',
      btn_load_code: 'Load from code',
      btn_copy_code: 'Copy code',
      code_hint: 'Compatible with the original format, e.g. 330121---;nMW;---',
      tools_h2: 'Tools',
      verify_h2: 'Verify & save',
      name_placeholder: 'Level name',
      btn_verify: '🔍 Verify solvable',
      btn_demo: '▶ Play solution',
      btn_playtest: '🧪 Playtest',
      btn_save_custom: '💾 Save as custom level',
      customs_h2: 'My custom levels',
      btn_export_customs: '⤓ Export (JSON)',
      tpl_h2: 'Start from a built-in level',
      btn_tpl_load: 'Load',

      tool_wall: 'Wall',
      tool_eraser: 'Eraser',
      tool_player: 'Player',
      tool_target: 'Set target',
      tool_red_up: 'Red · open ↑',
      tool_red_right: 'Red · open →',
      tool_red_down: 'Red · open ↓',
      tool_red_left: 'Red · open ←',
      tool_blue_up: 'Blue · open ↑',
      tool_blue_right: 'Blue · open →',
      tool_blue_down: 'Blue · open ↓',
      tool_blue_left: 'Blue · open ←',
      msg_target_on_box: '"Set target" must be clicked on a red or blue box',
      msg_need_player: 'Place a player (black dot)',
      msg_need_red: 'Place at least one red box',
      msg_need_blue: 'Place at least one blue box',
      msg_level_ok: 'Level format OK',
      msg_level_warn: '⚠ {err}',
      no_customs: 'No custom levels yet. Custom levels appear under the "Custom levels" group in the game\'s level menu.',
      custom_par_suffix: ' (shortest {n} steps)',
      btn_edit: 'Edit',
      btn_play: '▶ Play',
      confirm_delete_custom: 'Delete custom level "{name}"?',
      solve_calculating: 'Calculating…',
      solve_ok: '✔ Solvable! Shortest {n} steps (searched {nodes} states)\n{arrows}',
      solve_too_many: '⚠ Too many states — can\'t decide solvability in reasonable time',
      solve_none: '✘ This level has no solution',
      demo_unsolvable: 'No solution — nothing to demonstrate',
      demo_done: '🎉 Demo complete!',
      demo_start: 'Demo starting',
      demo_step: 'Step {k}: {arrow}',
      step_counter: '{i} / {n}',
      custom_default_name: 'Custom level {date}',
      toast_dup: 'A level with the same code already exists: {name}',
      confirm_overwrite: 'Overwrite "{name}"? (Cancel to save as a new level)',
      toast_custom_saved: 'Saved: {name}',
      confirm_clear_board: 'Clear the entire board?',
      toast_code_loaded: 'Loaded',
      toast_code_bad: '⚠ Bad code: {msg}',
      toast_copied_short: 'Copied',
      tpl_edited_suffix: ' (edited)',
      playtest_default_name: 'Playtest level',
      import_custom_default_name: 'Imported level',
      toast_imported_customs: 'Imported {n} level(s)',
      file_save_customs: 'BoxUp-custom-levels.json',
      file_save_all: 'BoxUp-saves.json',
    },
  };

  function detectLang() {
    try {
      const saved = localStorage.getItem(K_LANG);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {}
    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.startsWith('zh') ? 'zh' : 'en';
  }

  let lang = detectLang();

  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) || (DICT.en && DICT.en[key]) || key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }

  function applyStatic(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      el.innerHTML = t(k);
    });
    (root || document).querySelectorAll('[data-i18n-text]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n-text'));
    });
    (root || document).querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    (root || document).querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    const pt = document.querySelector('[data-i18n-doctitle]');
    if (pt) document.title = t(pt.getAttribute('data-i18n-doctitle'));
    document.documentElement.lang = (lang === 'zh') ? 'zh-Hant' : 'en';
  }

  function setLang(nl) {
    if (nl !== 'zh' && nl !== 'en') return;
    lang = nl;
    try { localStorage.setItem(K_LANG, nl); } catch (e) {}
    applyStatic();
    if (typeof window.onI18nChange === 'function') window.onI18nChange();
    const btn = document.getElementById('langBtn');
    if (btn) btn.textContent = t('lang_toggle_label');
  }

  function toggle() { setLang(lang === 'zh' ? 'en' : 'zh'); }

  // 建立語言切換按鈕(放在 header .top 的最右邊)
  function installToggle() {
    const header = document.querySelector('header.top');
    if (!header || document.getElementById('langBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'langBtn';
    btn.className = 'small lang-btn';
    btn.type = 'button';
    btn.title = t('lang_toggle_title');
    btn.textContent = t('lang_toggle_label');
    btn.addEventListener('click', toggle);
    header.appendChild(btn);
  }

  function init() {
    installToggle();
    applyStatic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.I18N = { t, get lang() { return lang; }, setLang, toggle, apply: applyStatic };
})();
