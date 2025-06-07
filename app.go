package main

import (
	"context"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	runtime.WindowShow(a.ctx)
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
