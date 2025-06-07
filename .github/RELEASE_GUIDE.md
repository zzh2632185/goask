# 发布指南

## 快速发布流程

### 1. 准备发布
确保所有更改已合并到主分支：
```bash
git checkout main
git pull origin main
```

### 2. 创建发布标签
```bash
# 创建标签（遵循语义化版本）
git tag v1.0.0

# 推送标签到远程仓库
git push origin v1.0.0
```

### 3. 自动构建和发布
推送标签后，GitHub Actions会自动：
- 在Windows、Linux、macOS平台构建应用
- 创建GitHub Release
- 上传所有平台的二进制文件

### 4. 验证发布
访问GitHub仓库的Releases页面，确认：
- Release已创建
- 所有平台的文件都已上传
- Release notes已自动生成

## 版本号规范

使用[语义化版本](https://semver.org/lang/zh-CN/)：
- `v1.0.0` - 主版本.次版本.修订版本
- `v1.0.0-beta.1` - 预发布版本
- `v1.0.0-alpha.1` - 内测版本

## 发布文件说明

每次发布会生成以下文件：
- `goask-windows-amd64.exe` - Windows 64位可执行文件
- `goask-linux-amd64` - Linux 64位可执行文件  
- `goask-darwin-amd64.zip` - macOS Intel版本应用包
- `goask-darwin-arm64.zip` - macOS Apple Silicon版本应用包

## 故障排除

### 构建失败
1. 检查GitHub Actions日志
2. 确认代码在本地能正常构建
3. 验证依赖版本是否兼容

### 发布失败
1. 确认标签格式正确（以v开头）
2. 检查GitHub token权限
3. 确认所有平台构建都成功

### 本地测试
在推送标签前，可以本地测试构建：
```bash
# 测试所有平台构建
wails build -platform windows/amd64
wails build -platform linux/amd64  
wails build -platform darwin/amd64
wails build -platform darwin/arm64
```

## 手动发布（备用方案）

如果自动发布失败，可以手动创建Release：
1. 在GitHub仓库页面点击"Releases"
2. 点击"Create a new release"
3. 选择或创建标签
4. 填写发布说明
5. 上传构建好的二进制文件
6. 点击"Publish release"
