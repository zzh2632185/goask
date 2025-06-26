import './style.css';
import './app.css';

import { GetQuestion, UserSubmitAnswer, UserCancelAnswer, ProcessImage } from '../wailsjs/go/main/App';

// 创建可拖拽调整大小的三层布局HTML结构
document.querySelector('#app').innerHTML = `
    <div class="dialogue-container">
        <!-- 上层：显示JSON数据 -->
        <div class="json-display-section resizable-panel" id="jsonPanel">
            <h5>AI询问：</h5>
            <div class="json-content" id="jsonContent">
                加载中...
            </div>
        </div>

        <!-- 第一个拖拽分隔条 -->
        <div class="resize-handle" id="resizeHandle1"></div>

        <!-- 中层：输入框和按钮 -->
        <div class="input-section resizable-panel" id="inputPanel">
            <textarea
                id="textInput"
                placeholder="请输入您的内容，按Enter键提交"
                rows="4"
            ></textarea>
            <div class="button-group">
                <div class="prefix-group">
                    <input type="checkbox" id="prefixCheckbox" class="prefix-checkbox">
                    <label for="prefixCheckbox" class="prefix-label">前缀：</label>
                    <input type="text" id="prefixText" class="prefix-input" placeholder="输入前缀内容">
                    <button type="button" class="btn-clear-prefix" onclick="clearPrefixSettings()" title="清空前缀设置">×</button>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="submitAnswer()">发送</button>
                    <button class="btn btn-secondary" onclick="cancelAnswer()">取消</button>
                </div>
            </div>
        </div>

        <!-- 第二个拖拽分隔条 -->
        <div class="resize-handle" id="resizeHandle2"></div>

        <!-- 下层：图片预览和上传 -->
        <div class="image-section resizable-panel" id="imagePanel">
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
    setupResizeHandlers(); // 设置拖拽调整大小功能
    setupPrefixHandlers(); // 设置前缀功能

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

// 清空输入和图片（保留前缀设置）
function clearInputs() {
    const textInput = document.getElementById('textInput');
    textInput.value = '';

    // 不清空前缀设置，保持用户的前缀配置
    // 前缀设置会通过本地存储自动保持

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
    const prefixCheckbox = document.getElementById('prefixCheckbox');
    const prefixText = document.getElementById('prefixText');

    let text = textInput.value.trim();

    // 如果勾选了前缀复选框，则将前缀内容添加到文本前面
    if (prefixCheckbox.checked && prefixText.value.trim()) {
        const prefix = prefixText.value.trim();
        text = prefix + '\n' + text;
    }

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

// 清空前缀设置
window.clearPrefixSettings = function () {
    const prefixCheckbox = document.getElementById('prefixCheckbox');
    const prefixText = document.getElementById('prefixText');

    prefixCheckbox.checked = false;
    prefixText.value = '';
    prefixText.disabled = true;

    // 清空本地存储
    localStorage.removeItem('goask_prefix_settings');
};

// 设置前缀功能
function setupPrefixHandlers() {
    const prefixCheckbox = document.getElementById('prefixCheckbox');
    const prefixText = document.getElementById('prefixText');

    // 从本地存储恢复前缀设置
    loadPrefixSettings();

    // 初始状态：根据复选框状态设置文本框
    prefixText.disabled = !prefixCheckbox.checked;

    // 复选框状态改变时，控制文本框的启用/禁用
    prefixCheckbox.addEventListener('change', function() {
        prefixText.disabled = !this.checked;
        if (!this.checked) {
            // 取消勾选时不清空文本框，保留内容但禁用
        } else {
            prefixText.focus(); // 勾选时聚焦到文本框
        }
        // 保存复选框状态
        savePrefixSettings();
    });

    // 文本框内容改变时保存
    prefixText.addEventListener('input', function() {
        savePrefixSettings();
    });

    // 文本框回车键也可以提交
    prefixText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitAnswer();
        }
    });
}

// 保存前缀设置到本地存储
function savePrefixSettings() {
    const prefixCheckbox = document.getElementById('prefixCheckbox');
    const prefixText = document.getElementById('prefixText');

    const settings = {
        checked: prefixCheckbox.checked,
        text: prefixText.value
    };

    localStorage.setItem('goask_prefix_settings', JSON.stringify(settings));
}

// 从本地存储加载前缀设置
function loadPrefixSettings() {
    const prefixCheckbox = document.getElementById('prefixCheckbox');
    const prefixText = document.getElementById('prefixText');

    try {
        const saved = localStorage.getItem('goask_prefix_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            prefixCheckbox.checked = settings.checked || false;
            prefixText.value = settings.text || '';
        }
    } catch (error) {
        console.log('加载前缀设置失败:', error);
        // 如果加载失败，使用默认值
        prefixCheckbox.checked = false;
        prefixText.value = '';
    }
}

// 设置拖拽调整大小功能
function setupResizeHandlers() {
    const container = document.querySelector('.dialogue-container');
    const jsonPanel = document.getElementById('jsonPanel');
    const inputPanel = document.getElementById('inputPanel');
    const imagePanel = document.getElementById('imagePanel');
    const resizeHandle1 = document.getElementById('resizeHandle1');
    const resizeHandle2 = document.getElementById('resizeHandle2');

    let isResizing = false;
    let currentHandle = null;
    let startY = 0;
    let startHeight1 = 0;
    let startHeight2 = 0;
    let startHeight3 = 0;

    // 获取面板高度的函数
    function getPanelHeights() {
        return {
            json: jsonPanel.offsetHeight,
            input: inputPanel.offsetHeight,
            image: imagePanel.offsetHeight
        };
    }

    // 设置面板高度的函数
    function setPanelHeights(jsonHeight, inputHeight, imageHeight) {
        jsonPanel.style.height = jsonHeight + 'px';
        inputPanel.style.height = inputHeight + 'px';
        imagePanel.style.height = imageHeight + 'px';
    }

    // 第一个拖拽条的事件处理
    resizeHandle1.addEventListener('mousedown', function(e) {
        isResizing = true;
        currentHandle = 1;
        startY = e.clientY;
        const heights = getPanelHeights();
        startHeight1 = heights.json;
        startHeight2 = heights.input;
        startHeight3 = heights.image;

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    // 第二个拖拽条的事件处理
    resizeHandle2.addEventListener('mousedown', function(e) {
        isResizing = true;
        currentHandle = 2;
        startY = e.clientY;
        const heights = getPanelHeights();
        startHeight1 = heights.json;
        startHeight2 = heights.input;
        startHeight3 = heights.image;

        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;

        const deltaY = e.clientY - startY;
        const minHeight = 100; // 最小高度限制

        if (currentHandle === 1) {
            // 调整第一个和第二个面板的大小
            const newJsonHeight = Math.max(minHeight, startHeight1 + deltaY);
            const newInputHeight = Math.max(minHeight, startHeight2 - deltaY);

            // 确保总高度不变
            if (newJsonHeight >= minHeight && newInputHeight >= minHeight) {
                setPanelHeights(newJsonHeight, newInputHeight, startHeight3);
            }
        } else if (currentHandle === 2) {
            // 调整第二个和第三个面板的大小
            const newInputHeight = Math.max(minHeight, startHeight2 + deltaY);
            const newImageHeight = Math.max(minHeight, startHeight3 - deltaY);

            // 确保总高度不变
            if (newInputHeight >= minHeight && newImageHeight >= minHeight) {
                setPanelHeights(startHeight1, newInputHeight, newImageHeight);
            }
        }
    });

    // 鼠标释放事件
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            currentHandle = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    // 防止拖拽时选中文本
    resizeHandle1.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });

    resizeHandle2.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });
}
