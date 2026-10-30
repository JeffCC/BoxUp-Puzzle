# Box Up 箱中箱

網頁版 Box Up 推箱解謎遊戲，附關卡編輯器。純 HTML / CSS / JavaScript，不需安裝任何套件。

> 介面會依瀏覽器語系自動切換中文／英文，右上角的語言按鈕可手動切換。

## 玩法
- 移動小黑點（玩家）。箱子是缺一邊的方框，**缺口**就是入口，只能從缺口走進箱子。
- 在箱子裡往缺口方向走會離開箱子；往其他方向走會推著箱子一起移動。
- 紅箱可以從藍箱的缺口推進藍箱；藍箱放不進紅箱，同色箱子也不能互相放入。
- 目標：小黑點進入紅箱，再把紅箱推進藍箱。黑色箱子只是障礙。

## 功能
### 遊戲（`index.html`）
- 內建 29 關，依作者分組：Andrea Gilbert 12 關、Don O'Brien 5 關、Bob Henderson 12 關（4x3）
- 移動規則與原版一致（Don 的 5 關最短解為 47 / 68 / 82 / 97 / 108 步）
- 方向鍵、WASD、畫面方向鍵、點擊相鄰格、手機滑動
- 移動紀錄（↑↓←→）、步數、個人最佳、最短解步數
- 復原（Z）、重新開始（R）、提示一步（H）、播放最短解
- 存檔：命名存檔、載入繼續、重播、下載 .txt、匯出／匯入 JSON
- 過關自動存解法到 `solution/` 目錄，檔名為「關卡名稱_步數.txt」（例：`Andrea 3x3 #1_5.txt`）
- 介面語系自動切換（中文 / English），右上角按鈕可手動切換

### 關卡編輯器（`editor.html`）
- 自訂棋盤大小（2×2 ～ 15×15）
- 工具：牆、橡皮擦、玩家、四個方向的紅箱與藍箱、設為目標（★）；右鍵旋轉箱子開口
- 驗證可解（BFS 求最短解）、試玩、存為自訂關卡（會出現在遊戲選單）
- 關卡代碼匯入／匯出、以內建關卡為範本

## 執行
建議用附的本機伺服器啟動（過關時才能自動把解法寫進 `solution/` 目錄）：

```bash
python server.py
```

然後開啟 http://localhost:8765 。

也可以直接用瀏覽器開啟 `index.html`：這時在 Chrome / Edge 可按「選擇 solution 資料夾」指定存檔位置，否則過關解法會改用瀏覽器下載。

存檔與自訂關卡保存在瀏覽器的 localStorage，換瀏覽器或清除網站資料會遺失，請用「匯出 JSON」備份。

## 關卡代碼格式
與 mansoft.nl 版相容，例如 `330121---;nMW;---`：

| 位置 | 意義 |
|---|---|
| 第 1–2 碼 | 寬、高 |
| 第 3–4 碼 | 目標紅箱的 x、y |
| 第 5–6 碼 | 目標藍箱的 x、y |
| 其後 | 各列內容，以 `;` 分隔 |

格子字元：`-` 空地、`X` 牆、`M` 玩家、`n e s w` 紅箱（開口朝上／右／下／左）、`N E S W` 藍箱。
同一格放多樣東西時用中括號，例如 `[MN]` 玩家在藍箱內、`[MeS]` 玩家在紅箱內且紅箱在藍箱內。

## 檔案結構
| 檔案 | 說明 |
|---|---|
| `index.html` | 遊戲主頁 |
| `editor.html` | 關卡編輯器 |
| `boxup-core.js` | 核心：關卡解析、移動規則、求解器、SVG 繪製 |
| `levels.js` | 內建 29 關 |
| `i18n.js` | 中英文語系切換 |
| `server.py` | 本機伺服器（提供網頁＋寫入 solution/） |
| `style.css` | 共用樣式（支援深色模式） |

## 來源
- 遊戲原創：Andrea Gilbert，[clickmazes.com BoxUp](https://clickmazes.com/boxup/new-boxup.htm)
- 關卡設計 © Andrea Gilbert 2003、Don O'Brien 2003、Bob Henderson 2012
- 關卡依原作者的 [PuzzleScript 版（2022）](https://auroriax.github.io/PuzzleScript/play.html?p=192b7403618c6c10eccb83986283053b) 與 [mansoft.nl SVG 版](https://www.mansoft.nl/svg/boxup.html) 重現

---

# Box Up (English)

A web version of Andrea Gilbert's **Box Up** push-the-box puzzle, with a built-in level editor. Pure HTML / CSS / JavaScript — no install, no build step.

> The UI auto-detects your browser language and switches between Traditional Chinese and English. A language button in the top-right corner toggles it manually.

## How to play
- Move the player (black dot). Each box has one open side — the **opening** is the only way in.
- Walking out through the opening leaves the box; walking any other direction **pushes the box with you**.
- A red box can be pushed into a blue box through the blue box's opening. A blue box cannot enter a red box, and boxes cannot collide with another box of the same color.
- Goal: get the player into the red box, then push the red box into the blue box. Black boxes are just obstacles.

## Features
### Game (`index.html`)
- 29 built-in levels grouped by author: Andrea Gilbert (12), Don O'Brien (5), Bob Henderson (12, each 4×3)
- Movement matches the original (Don's five levels have optimal solutions of 47 / 68 / 82 / 97 / 108 steps)
- Arrow keys, WASD, on-screen D-pad, click on an adjacent cell, swipe on touch
- Move log (↑↓←→), step counter, personal best, shortest-solution par
- Undo (Z), Restart (R), Hint (H), Play shortest solution
- Saves: named saves, load & continue, replay, download `.txt`, export / import JSON
- Auto-save solutions to `solution/` as `LevelName_Steps.txt` (e.g. `Andrea 3x3 #1_5.txt`)
- Auto language switching (Chinese / English) with a manual toggle in the top-right

### Level editor (`editor.html`)
- Custom board sizes (2×2 to 15×15)
- Tools: wall, eraser, player, red/blue boxes with four opening directions, "set as target" (★); right-click rotates the box opening
- Verify solvability (BFS shortest solution), playtest, save as a custom level (appears in the game's level menu)
- Import / export level codes, start from a built-in level as a template

## Running
Launch the included local server so solved solutions can be written directly to `solution/`:

```bash
python server.py
```

Then open http://localhost:8765 .

You can also open `index.html` directly in a browser. In Chrome / Edge, use "Choose solution folder" to pick a save location; otherwise solved solutions are delivered as browser downloads.

Saves and custom levels live in the browser's `localStorage` and are lost if you switch browsers or clear site data — use "Export JSON" to back them up.

## Level code format
Compatible with the mansoft.nl version, e.g. `330121---;nMW;---`:

| Position | Meaning |
|---|---|
| Chars 1–2 | Width, height |
| Chars 3–4 | Target red-box x, y |
| Chars 5–6 | Target blue-box x, y |
| Rest | Rows, separated by `;` |

Cell characters: `-` empty, `X` wall, `M` player, `n e s w` red box (opening up / right / down / left), `N E S W` blue box.
Stack multiple things on one cell with brackets, e.g. `[MN]` player inside a blue box, `[MeS]` player inside a red box that is itself inside a blue box.

## File layout
| File | Description |
|---|---|
| `index.html` | Game page |
| `editor.html` | Level editor |
| `boxup-core.js` | Core: level parsing, movement rules, solver, SVG rendering |
| `levels.js` | 29 built-in levels |
| `i18n.js` | Chinese / English language switch |
| `server.py` | Local server (serves pages + writes `solution/`) |
| `style.css` | Shared styles (dark-mode aware) |

## Credits
- Original game: Andrea Gilbert, [clickmazes.com BoxUp](https://clickmazes.com/boxup/new-boxup.htm)
- Level designs © Andrea Gilbert 2003, Don O'Brien 2003, Bob Henderson 2012
- Levels reproduced from the authors' [PuzzleScript edition (2022)](https://auroriax.github.io/PuzzleScript/play.html?p=192b7403618c6c10eccb83986283053b) and the [mansoft.nl SVG version](https://www.mansoft.nl/svg/boxup.html)
