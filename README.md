# Snakegame

一个经典贪吃蛇小游戏，支持：

- 浏览器本地运行
- Windows 桌面版 `.exe`
- GitHub Actions 自动构建 Windows 可执行文件

仓库地址：[liangkic/Snakegame](https://github.com/liangkic/Snakegame)  
Release 页面：[v1.0.0](https://github.com/liangkic/Snakegame/releases/tag/v1.0.0)

## 项目结构

- `Snakegame/`：游戏源码、测试、Electron 桌面壳、打包配置
- `Snakegame/src/`：核心游戏逻辑和前端入口
- `Snakegame/electron/`：桌面应用入口
- `Snakegame/test/`：核心逻辑测试
- `Snakegame/dist/`：本地构建生成的 Windows 可执行文件

## 本地运行

### 1. 运行网页版

```powershell
cd C:\AI\Codex\Snakegame
node server.js
```

然后打开：

`http://localhost:3000`

### 2. 运行桌面版

```powershell
cd C:\AI\Codex\Snakegame
npm.cmd install
npm.cmd run start
```

## 运行测试

```powershell
cd C:\AI\Codex\Snakegame
node --test
```

当前测试覆盖：

- 蛇的初始状态
- 基础移动
- 禁止立即反向移动
- 吃到食物后增长与加分
- 撞墙结束
- 撞到自己结束
- 食物不会生成在蛇身上
- 重开后状态重置
- 暂停时不推进游戏

## 本地打包 Windows EXE

```powershell
cd C:\AI\Codex\Snakegame
npm.cmd install
npm.cmd run build
```

打包输出目录：

- `Snakegame/dist/Snakegame-1.0.0.exe`

## GitHub Actions 自动构建

仓库已经配置 GitHub Actions：

- 推送到 `main` 时：自动执行测试并构建 Windows `.exe`
- 推送形如 `v1.0.1` 的 tag 时：自动把 `.exe` 上传到对应 GitHub Release
- 也可以在 GitHub Actions 页面手动触发发布流程，直接输入版本 tag 生成 Release

Actions 页面：

[https://github.com/liangkic/Snakegame/actions](https://github.com/liangkic/Snakegame/actions)

## 操作说明

- 方向键 / `WASD`：移动
- `Space`：暂停 / 继续
- `R`：重新开始

## 手动验收清单

- 方向键和 `WASD` 都能正常控制移动
- 蛇不能立即反向转头撞进自己
- 吃到食物后长度增加，分数增加
- 撞墙后游戏结束
- 撞到自己后游戏结束
- 暂停后画面保持不变，继续后恢复
- 重新开始后棋盘、分数、状态全部重置

## 发布说明

当前仓库已经包含：

- 源码仓库
- `v1.0.0` Release
- Windows 可执行文件附件

如果后续继续发布新版本，推荐流程：

```powershell
git add .
git commit -m "your change"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

推送 tag 后，GitHub Actions 会自动构建并把新的 `.exe` 发布到对应 Release。
