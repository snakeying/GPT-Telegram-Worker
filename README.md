# Telegram 机器人项目

这是一个使用 TypeScript 编写的 Telegram 机器人项目。该机器人提供多语言支持，并使用 Redis 进行数据存储。

## 项目结构

- `src/`: 源代码目录
  - `api/`: API 相关代码
  - `config/`: 配置文件
  - `utils/`: 工具函数
- `types/`: TypeScript 类型定义
- `dist/`: 编译后的 JavaScript 文件

## 主要功能

1. Telegram 机器人交互
2. 多语言支持 (i18n)
3. Redis 数据存储
4. 命令处理
5. 多模型 AI 支持（OpenAI, Google Gemini）
6. 图像分析功能

## 配置

项目使用环境变量进行配置。主要的配置项包括:

- `BOT_TOKEN`: Telegram 机器人令牌
- `REDIS_URL`: Redis 服务器 URL
- `LANGUAGE`: 默认语言设置
- `OPENAI_API_KEY`: OpenAI API 密钥
- `GOOGLE_MODEL_KEY`: Google AI 模型 API 密钥

请确保在运行项目之前正确设置这些环境变量。

## 使用方法

1. 安装依赖:
   ```
   npm install
   ```

2. 设置环境变量

3. 编译 TypeScript:
   ```
   npm run build
   ```

4. 运行机器人:
   ```
   npm start
   ```

## 新增功能：图像分析

现在，用户可以发送图片并附带说明文字，机器人将使用当前选择的 AI 模型（OpenAI 或 Google Gemini）来分析图片并生成响应。

## 可能的改进

1. 添加更多的命令和功能
2. 实现用户认证和授权
3. 添加错误处理和日志记录
4. 编写单元测试和集成测试
5. 优化 Redis 数据存储结构
6. 添加更多语言支持
7. 支持更多的 AI 模型进行图像分析

## 贡献

欢迎提交 Pull Requests 来改进这个项目。在提交之前，请确保您的代码符合项目的编码规范并通过所有测试。

## 许可证

[待添加许可证信息]
