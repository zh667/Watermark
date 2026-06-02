# CLAUDE.md

> 本文件是给 AI（Claude Code）阅读并遵守的项目协作规范。
> 放在项目根目录，AI 每次会自动读取并按此干活。

---

## 项目信息

- **项目名称**：去水印微信小程序
- **技术栈**：微信原生小程序（WXML/WXSS/JS） + Node.js(Express) 后端
- **安装依赖**：`cd server && npm install`
- **运行测试**：`npm test`
- **代码检查**：`npm run lint`
- **格式检查**：`npm run format:check`
- **构建**：`npm run build`
- **运行后端**：`cd server && node server.js`
- **协作模式**：自有项目
- **需求文档**：`.omc/specs/deep-interview-watermark-miniprogram.md`
- **实现方案**：`.omc/plans/watermark-miniprogram-plan.md`

### 项目结构

```
Watermark/
├── miniprogram/          # 微信小程序前端
│   ├── pages/            # 页面（index/result/history/tutorial/faq/contact）
│   ├── utils/            # 工具函数（api.js, storage.js, util.js）
│   └── images/           # 静态图片资源
└── server/               # Node.js 后端
    ├── routes/            # Express 路由
    └── services/          # 第三方 API 调用封装
```

---

## 通用铁律（任何时候都遵守）

1. 永远不在 `main` 上直接改动；一切走分支 + PR。
2. 一个改动 = 一个分支 = 一个 PR；提交保持原子化。
3. 提交信息用 Conventional Commits：`类型(范围): 描述`，类型取 `feat/fix/docs/refactor/test/chore/perf`。
4. 绝不提交密钥、`.env`、凭证；发现这类内容立刻提醒我并加入 `.gitignore`。
5. 不对共享分支强推（`--force`）。
6. 写代码前先说计划、得到我确认；每个关键步骤做完简要汇报。

---

## 开工前（开始写代码前必做）

1. **复述任务**：用一两句话说清本次目标与验收标准，不清楚先问我。
2. **查状态**：运行 `git status` 和 `git remote -v`，报告当前分支与远程。
3. **同步主干 + 切分支**：`git checkout main && git pull && git checkout -b feature/<描述>`
4. **先给方案**：说明要改哪些文件、实现思路、需要加哪些测试，我确认后再动手。
5. **带着测试写**：实现功能的同时写对应单元/集成测试（底层多、上层少）。
6. **对齐 CI**：看一眼 `.github/workflows/` 里 CI 会跑哪些检查，按其标准写，避免提交后红灯。

---

## 收工后（写完代码必做，逐步汇报）

1. **跑全套本地门禁**（对齐 CI）：lint、format:check、typecheck、test、build。有失败先修，**不带红灯提交**。
2. **安全自查**：确认无密钥/`.env`/凭证被提交；若引入新依赖，说明用途。
3. **通读改动**：`git diff`，用中文总结改了哪些文件、各自做了什么、有何风险点。
4. **提交**：用 Conventional Commits 写 message（必要时带 `Closes #<issue号>`），**先给我看再 commit**。
5. **推送**：推到功能分支 `git push origin <分支名>`，不直接进 main、不强推共享分支。
6. **起草 PR 描述**，含四部分：做了什么 / 为什么 · 怎么测试的 · 影响范围与回滚方式 · 关联 issue。
7. **提醒我**：合并前需要 CI 全绿 + 至少一名评审批准。

---

## 分支命名

`feature/` 新功能 · `fix/` 修 bug · `docs/` 文档 · `refactor/` 重构 · `test/` 测试 · `chore/` 杂务
后接简短描述，可带 issue 号，例：`fix/issue-123-null-crash`
