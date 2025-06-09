import './style.css';
import './app.css';

import { GetQuestion, UserSubmitAnswer, UserCancelAnswer, ProcessImage } from '../wailsjs/go/main/App';

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
                placeholder="请输入您的内容，按Enter键提交"
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

    // Add Shift+Enter to submit
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('keydown', function (e) {
        // Enter to submit, Shift+Enter for a new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent adding a new line
            submitAnswer();
        }
    });

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
    console.log('设置图片处理器，imagePreview:', imagePreview);

    // 拖拽功能
    imagePreview.addEventListener('dragover', function (e) {
        console.log('拖拽悬停');
        e.preventDefault();
        imagePreview.classList.add('drag-over');
    });

    imagePreview.addEventListener('dragleave', function (e) {
        console.log('拖拽离开');
        e.preventDefault();
        imagePreview.classList.remove('drag-over');
    });

    imagePreview.addEventListener('drop', function (e) {
        console.log('拖拽放下');
        e.preventDefault();
        imagePreview.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        console.log('拖拽文件数量:', files.length);
        if (files.length > 0) {
            const file = files[0];
            console.log('文件类型:', file.type);
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
    console.log('设置粘贴处理器');
    document.addEventListener('paste', function (e) {
        console.log('粘贴事件触发');
        const items = e.clipboardData.items;
        console.log('粘贴项目数量:', items.length);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log('粘贴项目类型:', item.type);
            if (item.type.startsWith('image/')) {
                console.log('检测到图片粘贴');
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
    console.log('开始处理图片文件:', file.name, file.type, file.size);
    const reader = new FileReader();
    reader.onload = async function (e) {
        console.log('文件读取完成');
        const dataUrl = e.target.result;
        const base64Data = dataUrl.split(',')[1]; // 获取base64数据部分

        try {
            console.log('调用后端处理图片');
            // 调用后端处理图片
            const result = await ProcessImage(base64Data);
            console.log('后端处理结果:', result);
            const compressedData = result.compressedData; // 压缩后的base64数据
            const mimeType = result.mimeType; // MIME类型

            // 更新全局变量
            currentImage = compressedData;
            currentMimeType = mimeType;

            // 显示预览图片
            const compressedDataUrl = `data:${mimeType};base64,${compressedData}`;
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${compressedDataUrl}" alt="预览图片" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block; margin: 0 auto;">`;
            console.log('图片处理完成并显示');
        } catch (error) {
            console.error('图片处理失败:', error);
            alert('图片处理失败，请重试');
        }
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
        alert('输入为空！');
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
