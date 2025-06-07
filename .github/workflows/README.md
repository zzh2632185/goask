# GitHub Actions Workflows

本项目包含两个主要的GitHub Actions工作流程：

## 1. Build and Release (`build-and-release.yml`)

### 功能
- **多平台构建**：支持Windows (amd64)、Linux (amd64)、macOS (amd64/arm64)
- **自动发布**：当推送tag时自动创建GitHub Release
- **构建缓存**：使用Go和npm缓存加速构建过程

### 触发条件
- 推送到 `main` 或 `master` 分支
- 推送以 `v` 开头的tag（如 `v1.0.0`）
- 对 `main` 或 `master` 分支的Pull Request

### 发布流程
1. 创建并推送tag：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. GitHub Actions会自动：
   - 构建所有平台的二进制文件
   - 创建GitHub Release
   - 上传构建产物

### 构建产物
- `goask-windows-amd64.exe` - Windows可执行文件
- `goask-linux-amd64` - Linux可执行文件
- `goask-darwin-amd64.zip` - macOS Intel版本应用包
- `goask-darwin-arm64.zip` - macOS Apple Silicon版本应用包

## 2. Test Build (`test-build.yml`)

### 功能
- **快速测试**：验证代码在所有平台上能正常构建
- **开发模式构建**：使用devtools模式进行测试构建
- **依赖验证**：检查Go模块和npm依赖

### 触发条件
- 推送到 `main`、`master` 或 `develop` 分支
- 对 `main` 或 `master` 分支的Pull Request

## 环境要求

### 系统依赖
- **Linux**: libgtk-3-dev, libwebkit2gtk-4.0-dev
- **Windows**: 无额外依赖
- **macOS**: 无额外依赖

### 软件版本
- Go: 1.23
- Node.js: 18
- Wails: latest

## 使用说明

### 本地开发
```bash
# 安装依赖
go mod tidy
cd frontend && npm install

# 开发模式运行
wails dev

# 构建
wails build
```

### 发布新版本
1. 确保所有更改已提交到main分支
2. 创建并推送tag：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. 等待GitHub Actions完成构建和发布

### 故障排除
- 如果构建失败，检查Go和Node.js版本是否匹配
- Linux构建需要GUI库，确保系统依赖已安装
- macOS构建可能需要代码签名（可选）

## 自定义配置

可以通过修改workflow文件中的环境变量来调整：
- `GO_VERSION`: Go版本
- `NODE_VERSION`: Node.js版本  
- `WAILS_VERSION`: Wails CLI版本

## 注意事项
- Release只在推送tag时触发
- 所有平台的构建必须成功才会创建Release
- macOS应用会被打包成zip文件以便分发
