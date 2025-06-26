package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png" // 支持PNG格式
	"sync"
	"time"

	"github.com/nfnt/resize"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	// 支持更多图片格式
	_ "golang.org/x/image/bmp"  // 支持BMP格式
	_ "golang.org/x/image/tiff" // 支持TIFF格式
	_ "golang.org/x/image/webp" // 支持WebP格式
)

// App struct
type App struct {
	ctx            context.Context
	question       string
	userAnswerChan chan UserAnswer
	Mu             sync.Mutex
	isAnswering    bool
	mcpHandled     bool
}

// UserAnswer 用户回答数据结构
type UserAnswer struct {
	Continue bool   `json:"continue"`
	Text     string `json:"text,omitempty"`
	Image    string `json:"image,omitempty"`
	MimeType string `json:"mimeType,omitempty"`
}

// ImageProcessResult 图片处理结果
type ImageProcessResult struct {
	CompressedData string `json:"compressedData"`
	MimeType       string `json:"mimeType"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		userAnswerChan: make(chan UserAnswer, 1),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	go a.startMCPServer()
}

// OnBeforeClose is called when the user attempts to close the window.
// It prevents the application from closing if it is waiting for a user's answer.
func (a *App) OnBeforeClose(ctx context.Context) (prevent bool) {
	a.Mu.Lock()
	defer a.Mu.Unlock()

	if a.isAnswering {
		// If we are in the middle of asking a question,
		// treat this as a cancellation.
		runtime.WindowHide(a.ctx)
		a.userAnswerChan <- UserAnswer{Continue: false}
		// Prevent the window from closing
		return true
	}

	// Allow the window to close
	return false
}

func (a *App) askUser(question string) UserAnswer {
	a.Mu.Lock()
	a.isAnswering = true
	a.Mu.Unlock()

	defer func() {
		a.Mu.Lock()
		a.isAnswering = false
		a.Mu.Unlock()
	}()

	a.question = question
	runtime.EventsEmit(a.ctx, "question", question)
	runtime.WindowSetAlwaysOnTop(a.ctx, true)
	runtime.WindowShow(a.ctx)
	go func() {
		time.Sleep(500 * time.Millisecond)
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
	}()
	return <-a.userAnswerChan
}

// GetQuestion 获取问题
func (a *App) GetQuestion() string {
	return a.question
}

// UserSubmitAnswer 用户提交回答
func (a *App) UserSubmitAnswer(data UserAnswer) {
	a.Mu.Lock()
	defer a.Mu.Unlock()
	if a.isAnswering {
		runtime.WindowHide(a.ctx)
		a.userAnswerChan <- data
	}
}

// UserCancelAnswer 用户取消回答
func (a *App) UserCancelAnswer() {
	a.Mu.Lock()
	defer a.Mu.Unlock()
	if a.isAnswering {
		runtime.WindowHide(a.ctx)
		a.userAnswerChan <- UserAnswer{Continue: false}
	}
}

// ProcessImage 处理图片压缩
func (a *App) ProcessImage(imageData string) (*ImageProcessResult, error) {
	// 解码base64图片数据
	data, err := base64.StdEncoding.DecodeString(imageData)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64: %v", err)
	}

	// 检测图片格式并解码
	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %v", err)
	}

	// 获取原始尺寸
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// 设置最大尺寸（更保守的尺寸以减小文件大小）
	const maxWidth = 800
	const maxHeight = 800

	// 计算新尺寸
	newWidth := width
	newHeight := height

	if width > height {
		if width > maxWidth {
			newHeight = height * maxWidth / width
			newWidth = maxWidth
		}
	} else {
		if height > maxHeight {
			newWidth = width * maxHeight / height
			newHeight = maxHeight
		}
	}

	// 调整图片尺寸
	var resizedImg image.Image
	if newWidth != width || newHeight != height {
		resizedImg = resize.Resize(uint(newWidth), uint(newHeight), img, resize.Lanczos3)
	} else {
		resizedImg = img
	}

	// 压缩为JPEG格式（高压缩率，广泛支持）
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, resizedImg, &jpeg.Options{Quality: 70}) // 使用JPEG格式，质量70
	if err != nil {
		return nil, fmt.Errorf("failed to encode JPEG: %v", err)
	}

	// 转换为base64
	compressedData := base64.StdEncoding.EncodeToString(buf.Bytes())

	return &ImageProcessResult{
		CompressedData: compressedData,
		MimeType:       "image/jpeg",
	}, nil
}
