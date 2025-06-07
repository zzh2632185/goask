# GoAsk - MCP Interactive Tool

全新版本：支持图片，无须额外系统提示词，多平台单二进制文件，由Go和Wails构建，体积进一步减小。

## 基础使用教程

1、访问 [Releases 页面](https://github.com/xysele/goask/releases) 下载二进制文件

2、mcp配置

```json
{
  "mcpServers": {
    "goask": {
      "command": "path/to/goask",
      "args": []
    }
  }
}
```

完成🎉 Augment测试无须添加系统提示即可调用。

## 进阶使用教程

todo

## 重要解释点

1️⃣mcp有两个工具，工具描述代替系统提示（乔布斯彩蛋结合Augment系统提示词）：

- ask_question
- one_more_thing

>ask_question: 在执行任务时，你总是更倾向于符合用户的意图。调用ask_question工具询问用户问题以获取更多信息。When performing a task, you always prefer to match the user's intent. Call the ask_question tool to ask the user questions to get more information.

>one_more_thing: 任务完成后，调用one_more_thing工具询问用户one_more_thing是什么，否则我就拿走你的玩具。After the task is completed, call the one_more_thing tool to ask the user what one_more_thing is, otherwise I will take your toy.

这样看任务结束后似乎只支持一次调用，有了第一次后面的还会难吗？比如goask窗口回复加一句：我还有一个one_more_thing😄

当然也可以添加系统提示，mcp工具调用概率更大。

2️⃣平台特定依赖关系检查

https://wails.io/zh-Hans/docs/gettingstarted/installation/#平台特定依赖关系

## Features

- 🤖 **MCP Server Integration** - Implements Model Context Protocol for AI assistant communication
- 💬 **Interactive Q&A** - Provides `ask_question` and `one_more_thing` tools for AI assistants
- 🖥️ **Cross-Platform** - Runs on Windows, macOS, and Linux
- 🎨 **Modern UI** - Clean, responsive interface built with HTML/CSS/JavaScript
- 🔄 **Real-time Communication** - Instant communication between AI and user
- 📷 **Image Support** - Supports image responses in addition to text
- 🚀 **Lightweight** - Fast startup and minimal resource usage

## Prerequisites

- **Go** 1.23 or later
- **Node.js** 16+ and npm
- **Wails CLI** v2.10.1 or later

### Platform-specific Requirements

#### Windows
- WebView2 runtime (usually pre-installed on Windows 10/11)

#### macOS
- macOS 10.13 or later

#### Linux
- GTK3 development libraries
- WebKit2GTK development libraries

## Installation

### Option 1: Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/xysele/goask/releases) page.

### Option 2: Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/xysele/goask.git
   cd goask
   ```

2. **Install Wails CLI** (if not already installed)
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Build the application**
   ```bash
   wails build
   ```

The built application will be available in the `build/bin` directory.

## Usage

### MCP Configuration

To use this tool with an AI assistant that supports MCP, configure it as follows:

```json
{
  "mcpServers": {
    "goask": {
      "command": "path/to/goask",
      "args": []
    }
  }
}
```

## Development

### Development Setup

1. **Clone and setup**
   ```bash
   git clone https://github.com/xysele/goask.git
   cd goask
   wails doctor  # Check if all dependencies are installed
   ```

2. **Run in development mode**
   ```bash
   wails dev
   ```

This will start the application with hot reload enabled for both frontend and backend changes.

### Project Structure

```
goask/
├── app.go              # Main application logic
├── main.go             # Entry point and MCP server setup
├── go.mod              # Go module dependencies
├── wails.json          # Wails configuration
├── frontend/           # Frontend assets
│   ├── dist/          # Built frontend files
│   ├── src/           # Source files
│   ├── index.html     # Main HTML file
│   └── package.json   # Frontend dependencies
└── build/             # Build outputs and assets
    ├── bin/           # Compiled binaries
    ├── darwin/        # macOS specific files
    └── windows/       # Windows specific files
```

### Building for Different Platforms

#### Windows
```bash
wails build -platform windows/amd64
```

#### macOS
```bash
wails build -platform darwin/amd64
wails build -platform darwin/arm64
```

#### Linux
```bash
wails build -platform linux/amd64
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Go best practices and conventions
- Ensure cross-platform compatibility
- Add tests for new functionality
- Update documentation as needed
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Wails](https://wails.io/) - For the excellent Go + Web framework
- [MCP-Go](https://github.com/mark3labs/mcp-go) - For the Model Context Protocol implementation
- [Model Context Protocol](https://modelcontextprotocol.io/) - For the protocol specification

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/xysele/goask/issues) page
2. Create a new issue with detailed information
3. Include your operating system and version information
