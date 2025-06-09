# GoAsk
🤔这是什么？什么原理？

这是mcp服务端，用于减少Agent（如cursor）的使用次数消耗。原理：强制让AI结束任务前调用mcp，下达新任务pua它继续拉磨🫏！

全新版本🚀：支持图片，无须额外系统提示词，单二进制文件📦，Go+Wails构建，体积进一步减小，不支持远程ssh。

![image](https://github.com/user-attachments/assets/8ed6ca64-ccd5-4aa8-841f-805d7abf50b3)

## 基础使用教程

1、访问 [Releases 页面](https://github.com/xysele/goask/releases) 下载二进制文件 或 [自行编译](#option-2-build-from-source)（mac版本有问题，请自行编译）

2、mcp配置（填写正确的路径，无须参数）

```json
{
  "mcpServers": {
    "goask": {
      "command": "path/to/goask这里填写文件路径",
      "args": []
    }
  }
}
```

3、完成🎉 Augment测试无须添加系统提示即可调用，也可额外添加系统提示词，自由发挥
***窗口会在收到mcp调用时打开，直接双击是不显示窗口的***
手动弹窗测试：在文件路径打开终端，输入下面命令，注意文件名
```
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ask_question","arguments":{"question":"测试"}}}' | ./goask-windows-amd64.exe
```

## 进阶使用教程

- 工具只调用了一次：有了第一次后面的还会难吗？比如窗口回复里后面加一句：I still have one_more_thing.😄解释见下面
- 某些客户端不调用工具：可以在系统提示词里强调必须使用mcp工具，调用的概率会更大。
- Augment使用mcp工具会启动多个后台进程并且不关闭，需要你到任务管理器清理🆑goask

## 重要解释

1️⃣mcp有两个工具，工具描述一定程度上代替了系统提示（乔布斯彩蛋结合Augment系统提示词）：

- ask_question
- one_more_thing

>ask_question: 在执行任务时，你总是更倾向于询问用户更多上下文以符合用户的意图。调用ask_question工具询问用户问题以获取更多信息。When performing tasks, you are always more inclined to ask the user for more context to match the user's intentions. Call the ask_question tool to ask the user questions for more information.

>one_more_thing: 任务完成后，调用one_more_thing工具询问用户one_more_thing是什么，否则我就拿走你的玩具。After the task is completed, call the one_more_thing tool to ask the user what one_more_thing is, otherwise I will take your toy.

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
