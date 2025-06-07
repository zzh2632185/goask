import './style.css';
import './app.css';

import { GetQuestion, UserSubmitAnswer, UserCancelAnswer } from '../wailsjs/go/main/App';

// 创建三层布局的HTML结构
document.querySelector('#app').innerHTML = `
    <div class="dialogue-container">
        <!-- 上层：显示JSON数据 -->
        <div class="json-display-section">
            <h5>AI询问：</h5>
            <div class="json-content" id="jsonContent">
                加载中...
            </div>
        </div>

        <!-- 中层：输入框和按钮 -->
        <div class="input-section">
            <textarea
                id="textInput"
                placeholder="请输入您的内容..."
                rows="4"
            ></textarea>
            <div class="button-group">
                <button class="btn btn-primary" onclick="submitAnswer()">发送</button>
                <button class="btn btn-secondary" onclick="cancelAnswer()">取消</button>
            </div>
        </div>

        <!-- 下层：图片预览和上传 -->
        <div class="image-section">
            <div class="image-preview" id="imagePreview">
                <span class="preview-placeholder">暂无图片，请拖拽图片至此处或点击上传，也可在输入框粘贴</span>
            </div>
            <input type="file" id="imageInput" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
            <button class="btn btn-upload" onclick="document.getElementById('imageInput').click()">上传图片</button>
        </div>
    </div>
`;

let currentImage = '';
let currentMimeType = '';

// 页面加载完成后获取JSON数据
window.addEventListener('DOMContentLoaded', function () {
    setupImageHandlers();
    setupPasteHandler();
    window.runtime.EventsOn("question", (question) => {
        document.getElementById('jsonContent').innerText = question;
    });
    window.runtime.EventsOn("clear", () => {
        clearInputs();
    });
    loadQuestion();
});

// 清空输入和图片
function clearInputs() {
    const textInput = document.getElementById('textInput');
    textInput.value = '';

    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '<span class="preview-placeholder">暂无图片，请拖拽图片至此处或点击上传，也可在输入框粘贴</span>';
    currentImage = '';
    currentMimeType = '';
}

// 设置图片处理器
function setupImageHandlers() {
    const imagePreview = document.getElementById('imagePreview');

    // 拖拽功能
    imagePreview.addEventListener('dragover', function (e) {
        e.preventDefault();
        imagePreview.classList.add('drag-over');
    });

    imagePreview.addEventListener('dragleave', function (e) {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');
    });

    imagePreview.addEventListener('drop', function (e) {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageFile(file);
            } else {
                alert('请拖拽图片文件');
            }
        }
    });
}

// 设置粘贴处理器
function setupPasteHandler() {
    document.addEventListener('paste', function (e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                handleImageFile(file);
                break;
            }
        }
    });
}

// 处理图片文件的通用函数
function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        // The backend expects a base64 string, not a data URL
        currentImage = dataUrl.split(',')[1];
        currentMimeType = file.type;
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = `<img src="${dataUrl}" alt="预览图片" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
    };
    reader.readAsDataURL(file);
}

// 加载question
function loadQuestion() {
    GetQuestion().then(question => {
        document.getElementById('jsonContent').innerText = question;
    }).catch(err => {
        console.error("获取问题失败:", err);
        document.getElementById('jsonContent').innerText = '获取问题失败';
    });
}

// 处理图片上传
window.handleImageUpload = function (event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
};

// 提交反馈
window.submitAnswer = function () {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();

    if (!text && !currentImage) {
        alert('请输入反馈内容或上传图片');
        return;
    }

    const userAnswer = {
        continue: true,
        text: text,
        image: currentImage,
        mimeType: currentMimeType
    };

    UserSubmitAnswer(userAnswer).catch((err) => {
        console.error('提交反馈失败:', err);
    });
};

// 取消反馈
window.cancelAnswer = function () {
    UserCancelAnswer().catch((err) => {
        console.error('取消反馈失败:', err);
    });
};
