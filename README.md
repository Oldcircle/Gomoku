<div align="center">
</div>

# 禅意五子棋 / Zen Gomoku

一个使用 React + TypeScript + Vite 构建的五子棋前端项目，支持 AI 对弈与悔棋功能，已适配 GitHub Pages 部署（输出目录 `docs/`，`base` 为 `/Gomoku/`）。

## 功能特性

- 19×19 棋盘与星位展示
- 本地 Minimax 算法 AI（无需外部模型或 API）
- 棋局优势评估与分析文案
- 悔棋功能（撤销最近一步）
- 中英双语界面切换

## 本地运行

- 先决条件：已安装最新的 Node.js
- 安装依赖：
  ```bash
  npm install
  ```
- 开发模式启动：
  ```bash
  npm run dev
  ```

> 说明：历史代码曾包含 Gemini 相关内容，但当前 AI 已迁移为本地算法，构建与运行不再依赖 `GEMINI_API_KEY`。

## 构建与部署（GitHub Pages）

- 生产构建：
  ```bash
  npm run build
  ```
  构建产物输出到 `docs/` 目录：
  - `docs/index.html`
  - `docs/assets/*`

- GitHub Pages 设置：
  进入仓库 Settings → Pages：
  - Source: Deploy from a branch
  - Branch: `main`
  - Folder: `/docs`

- 最终访问地址：
  `https://oldcircle.github.io/Gomoku/`

建议使用无痕/隐身模式访问以避免缓存影响。

## 使用悔棋

- 右侧控制面板新增“悔棋”按钮（中文/英文分别为“悔棋 / Undo”）。
- 当棋局有历史步骤时可用，点击后撤销最近一步，并恢复对应行棋方的回合。

---

# Zen Gomoku (English)

A Gomoku game built with React + TypeScript + Vite. It features a local Minimax-based AI, undo functionality, bilingual UI, and is configured for GitHub Pages (build to `docs/` with `base` set to `/Gomoku/`).

## Features

- 19×19 board with star points
- Local Minimax AI (no external models or API)
- Advantage gauge and analysis text
- Undo last move
- English/Chinese language toggle

## Run Locally

- Prerequisite: recent Node.js installed
- Install dependencies:
  ```bash
  npm install
  ```
- Start dev server:
  ```bash
  npm run dev
  ```

> Note: Older code referenced Gemini, but the current AI is fully local. `GEMINI_API_KEY` is not required to run or build.

## Build and Deploy (GitHub Pages)

- Production build:
  ```bash
  npm run build
  ```
  Outputs to `docs/`:
  - `docs/index.html`
  - `docs/assets/*`

- GitHub Pages settings:
  Settings → Pages:
  - Source: Deploy from a branch
  - Branch: `main`
  - Folder: `/docs`

- Final URL:
  `https://oldcircle.github.io/Gomoku/`

Open in an incognito window to avoid cache issues.
