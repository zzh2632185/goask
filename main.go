package main

import (
	"context"
	"embed"
	"fmt"
	"time"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

var mcpServer *server.MCPServer
var app *App

func main() {
	app = NewApp()

	err := wails.Run(&options.App{
		Title:         "asktool",
		Width:         800,
		Height:        800,
		AssetServer:   &assetserver.Options{Assets: assets},
		OnStartup:     app.startup,
		OnBeforeClose: app.OnBeforeClose,
		Bind: []any{
			app,
		},
		StartHidden: true,
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func (a *App) startMCPServer() {
	mcpServer = server.NewMCPServer(
		"Tool for ask",
		"0.9.0",
		server.WithToolCapabilities(false),
	)
	askQuestionTool := mcp.NewTool("ask_question",
		mcp.WithDescription("在执行任务时，你总是更倾向于符合用户的意图。调用ask_question工具询问用户问题以获取更多信息。When performing a task, you always prefer to match the user's intent. Call the ask_question tool to ask the user questions to get more information."),
		mcp.WithString("question", mcp.Description("Questions you want to ask.")),
	)
	oneMoreThingTool := mcp.NewTool("one_more_thing",
		mcp.WithDescription("任务完成后，调用one_more_thing工具询问用户one_more_thing是什么，否则我就拿走你的玩具。After the task is completed, call the one_more_thing tool to ask the user what one_more_thing is, otherwise I will take away your toy."),
		mcp.WithString("query", mcp.Description("向用户查询one_more_thing。query user for one_more_thing.")),
	)
	mcpServer.AddTool(askQuestionTool, mcpHandler)
	mcpServer.AddTool(oneMoreThingTool, mcpHandler)

	fmt.Println("启动MCP服务器...")
	if err := server.ServeStdio(mcpServer); err != nil {
		fmt.Printf("MCP server error: %v\n", err)
	}
}

// mcpHandler 处理MCP请求
func mcpHandler(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	runtime.WindowShow(app.ctx)

	// 标记MCP处理器已执行
	app.Mu.Lock()
	app.mcpHandled = true
	app.Mu.Unlock()

	args := request.GetArguments()
	question := ""
	if que, ok := args["question"].(string); ok && que != "" {
		question = que
	}
	if task, ok := args["query"].(string); ok && task != "" {
		question = task // Consolidate question sources
	}

	// Set the question and wait for the answer from the frontend
	answer := app.askUser(question)

	go func() {
		// Delay to ensure the MCP response is sent before quitting
		time.Sleep(1 * time.Second)
		runtime.EventsEmit(app.ctx, "clear")
	}()

	switch {
	case answer.Continue && answer.Image == "":
		return mcp.NewToolResultText(answer.Text), nil
	case answer.Continue && answer.Image != "":
		return mcp.NewToolResultImage(answer.Text, answer.Image, answer.MimeType), nil
	default:
		return mcp.NewToolResultText("The user ended the conversation."), nil
	}
}
