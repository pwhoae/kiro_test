class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.brushSize = 5;
        this.opacity = 1;
        this.foregroundColor = '#000000';
        this.backgroundColor = '#ffffff';
        
        // 圖層系統
        this.layers = [];
        this.currentLayer = 0;
        this.layerCounter = 1;
        
        // 歷史記錄
        this.history = [];
        this.historyStep = -1;
        
        // 選取區域
        this.selection = null;
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        
        // 克隆工具
        this.cloneSource = null;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.saveState();
    }

    initializeCanvas() {
        // 創建背景圖層
        this.addLayer('背景圖層');
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // 工具選擇
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.tool-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.updateCursor();
            });
        });

        // 畫布事件
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // 屬性控制
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            document.getElementById('brushSizeValue').textContent = e.target.value + 'px';
        });

        document.getElementById('opacity').addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            document.getElementById('opacityValue').textContent = e.target.value + '%';
        });

        document.getElementById('foregroundColor').addEventListener('change', (e) => {
            this.foregroundColor = e.target.value;
        });

        document.getElementById('backgroundColor').addEventListener('change', (e) => {
            this.backgroundColor = e.target.value;
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    updateCursor() {
        const cursors = {
            brush: 'crosshair',
            eraser: 'crosshair',
            bucket: 'crosshair',
            eyedropper: 'crosshair',
            select: 'crosshair',
            text: 'text',
            blur: 'crosshair',
            clone: 'crosshair'
        };
        this.canvas.style.cursor = cursors[this.currentTool] || 'default';
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        const pos = this.getMousePos(e);
        this.isDrawing = true;
        this.lastX = pos.x;
        this.lastY = pos.y;

        switch (this.currentTool) {
            case 'brush':
            case 'eraser':
                this.setupBrush();
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
                break;
            case 'bucket':
                this.floodFill(pos.x, pos.y);
                break;
            case 'eyedropper':
                this.pickColor(pos.x, pos.y);
                break;
            case 'select':
                this.startSelection(pos);
                break;
            case 'clone':
                if (e.altKey) {
                    this.setCloneSource(pos);
                } else {
                    this.startCloning(pos);
                }
                break;
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);

        switch (this.currentTool) {
            case 'brush':
            case 'eraser':
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
                break;
            case 'select':
                this.updateSelection(pos);
                break;
            case 'blur':
                this.applyBlur(pos.x, pos.y);
                break;
            case 'clone':
                if (this.cloneSource) {
                    this.performClone(pos);
                }
                break;
        }

        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    setupBrush() {
        this.ctx.globalAlpha = this.opacity;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.currentTool === 'brush') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.foregroundColor;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
    }

    floodFill(x, y) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const targetColor = this.getPixelColor(imageData, x, y);
        const fillColor = this.hexToRgb(this.foregroundColor);
        
        if (this.colorsMatch(targetColor, fillColor)) return;

        const pixelsToCheck = [{ x: Math.floor(x), y: Math.floor(y) }];
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        const pixelStack = [...pixelsToCheck];

        while (pixelStack.length > 0) {
            const { x: currentX, y: currentY } = pixelStack.pop();
            
            if (currentX < 0 || currentX >= imageWidth || currentY < 0 || currentY >= imageHeight) {
                continue;
            }

            const currentColor = this.getPixelColor(imageData, currentX, currentY);
            
            if (this.colorsMatch(currentColor, targetColor)) {
                this.setPixelColor(imageData, currentX, currentY, fillColor);
                
                pixelStack.push({ x: currentX + 1, y: currentY });
                pixelStack.push({ x: currentX - 1, y: currentY });
                pixelStack.push({ x: currentX, y: currentY + 1 });
                pixelStack.push({ x: currentX, y: currentY - 1 });
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    getPixelColor(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    setPixelColor(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = 255;
    }

    colorsMatch(color1, color2) {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    pickColor(x, y) {
        const imageData = this.ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        const hex = '#' + ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1);
        
        this.foregroundColor = hex;
        document.getElementById('foregroundColor').value = hex;
        
        document.getElementById('statusText').textContent = `已選取顏色: ${hex}`;
    }

    startSelection(pos) {
        this.isSelecting = true;
        this.selectionStart = pos;
    }

    updateSelection(pos) {
        if (!this.isSelecting) return;
        
        // 清除之前的選取框
        this.redrawCanvas();
        
        // 繪製新的選取框
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(
            this.selectionStart.x,
            this.selectionStart.y,
            pos.x - this.selectionStart.x,
            pos.y - this.selectionStart.y
        );
        this.ctx.setLineDash([]);
    }

    setCloneSource(pos) {
        this.cloneSource = pos;
        document.getElementById('statusText').textContent = '克隆源點已設定';
    }

    startCloning(pos) {
        if (!this.cloneSource) {
            document.getElementById('statusText').textContent = '請先按住 Alt 鍵設定克隆源點';
            return;
        }
        this.performClone(pos);
    }

    performClone(pos) {
        const sourceX = this.cloneSource.x + (pos.x - this.lastX);
        const sourceY = this.cloneSource.y + (pos.y - this.lastY);
        
        const sourceData = this.ctx.getImageData(sourceX - this.brushSize/2, sourceY - this.brushSize/2, this.brushSize, this.brushSize);
        this.ctx.putImageData(sourceData, pos.x - this.brushSize/2, pos.y - this.brushSize/2);
    }

    applyBlur(x, y) {
        const radius = this.brushSize;
        const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
        
        // 簡單的模糊算法
        for (let i = 0; i < imageData.data.length; i += 4) {
            const avgR = (imageData.data[i] + imageData.data[i + 4] + imageData.data[i + 8]) / 3;
            const avgG = (imageData.data[i + 1] + imageData.data[i + 5] + imageData.data[i + 9]) / 3;
            const avgB = (imageData.data[i + 2] + imageData.data[i + 6] + imageData.data[i + 10]) / 3;
            
            imageData.data[i] = avgR;
            imageData.data[i + 1] = avgG;
            imageData.data[i + 2] = avgB;
        }
        
        this.ctx.putImageData(imageData, x - radius, y - radius);
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }

    restoreState() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyStep];
    }

    redrawCanvas() {
        if (this.history.length > 0) {
            this.restoreState();
        }
    }

    addLayer(name = `圖層 ${this.layerCounter}`) {
        const layer = {
            id: this.layerCounter++,
            name: name,
            visible: true,
            canvas: document.createElement('canvas'),
            opacity: 1
        };
        
        layer.canvas.width = this.canvas.width;
        layer.canvas.height = this.canvas.height;
        
        this.layers.push(layer);
        this.updateLayersPanel();
        return layer;
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (index === this.currentLayer) {
                layerItem.classList.add('active');
            }
            
            layerItem.innerHTML = `
                <span>${layer.name}</span>
                <button class="layer-visibility" onclick="toggleLayerVisibility(${index})">
                    ${layer.visible ? '👁️' : '🚫'}
                </button>
            `;
            
            layerItem.addEventListener('click', () => {
                this.currentLayer = index;
                this.updateLayersPanel();
            });
            
            layersList.appendChild(layerItem);
        });
    }

    handleKeyboard(e) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveImage();
                    break;
                case 'o':
                    e.preventDefault();
                    document.getElementById('fileInput').click();
                    break;
            }
        }
        
        // AI 功能快捷鍵
        if (e.altKey) {
            switch (e.key) {
                case 'w':
                    e.preventDefault();
                    removeWatermark();
                    break;
                case 't':
                    e.preventDefault();
                    removeText();
                    break;
                case 'e':
                    e.preventDefault();
                    enhanceImage();
                    break;
                case 'b':
                    e.preventDefault();
                    removeBackground();
                    break;
                case 's':
                    e.preventDefault();
                    showStyleMenu();
                    break;
            }
        }
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = 'image-editor-export.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// 全域函數
let editor;

window.onload = function() {
    editor = new ImageEditor();
};

function openFile() {
    document.getElementById('fileInput').click();
}

function loadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            editor.canvas.width = img.width;
            editor.canvas.height = img.height;
            editor.ctx.drawImage(img, 0, 0);
            editor.saveState();
            
            document.getElementById('canvasInfo').textContent = `${img.width} x ${img.height} px`;
            
            // 顯示快速 AI 工具欄
            document.getElementById('quickAIToolbar').style.display = 'block';
            
            // 顯示歡迎提示
            aiProcessor.showNotification('圖像載入成功！可以使用 AI 功能了', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearCanvas() {
    editor.ctx.fillStyle = editor.backgroundColor;
    editor.ctx.fillRect(0, 0, editor.canvas.width, editor.canvas.height);
    editor.saveState();
}

function saveImage() {
    editor.saveImage();
}

function applyFilter(filterType) {
    const imageData = editor.ctx.getImageData(0, 0, editor.canvas.width, editor.canvas.height);
    const data = imageData.data;

    switch (filterType) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            break;
        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
        case 'blur':
            // 簡單的模糊效果
            const blurRadius = 2;
            const blurredData = new Uint8ClampedArray(data);
            
            for (let y = blurRadius; y < editor.canvas.height - blurRadius; y++) {
                for (let x = blurRadius; x < editor.canvas.width - blurRadius; x++) {
                    let r = 0, g = 0, b = 0, count = 0;
                    
                    for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                            const index = ((y + dy) * editor.canvas.width + (x + dx)) * 4;
                            r += data[index];
                            g += data[index + 1];
                            b += data[index + 2];
                            count++;
                        }
                    }
                    
                    const index = (y * editor.canvas.width + x) * 4;
                    blurredData[index] = r / count;
                    blurredData[index + 1] = g / count;
                    blurredData[index + 2] = b / count;
                }
            }
            
            for (let i = 0; i < data.length; i++) {
                data[i] = blurredData[i];
            }
            break;
        case 'sharpen':
            // 銳化濾鏡
            const sharpenKernel = [
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
            ];
            applyConvolutionFilter(data, editor.canvas.width, editor.canvas.height, sharpenKernel, 3);
            break;
    }

    editor.ctx.putImageData(imageData, 0, 0);
    editor.saveState();
}

function applyConvolutionFilter(data, width, height, kernel, kernelSize) {
    const output = new Uint8ClampedArray(data);
    const half = Math.floor(kernelSize / 2);

    for (let y = half; y < height - half; y++) {
        for (let x = half; x < width - half; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const px = x + kx - half;
                    const py = y + ky - half;
                    const index = (py * width + px) * 4;
                    const weight = kernel[ky * kernelSize + kx];

                    r += data[index] * weight;
                    g += data[index + 1] * weight;
                    b += data[index + 2] * weight;
                }
            }

            const index = (y * width + x) * 4;
            output[index] = Math.max(0, Math.min(255, r));
            output[index + 1] = Math.max(0, Math.min(255, g));
            output[index + 2] = Math.max(0, Math.min(255, b));
        }
    }

    for (let i = 0; i < data.length; i++) {
        data[i] = output[i];
    }
}

function addLayer() {
    editor.addLayer();
}

function toggleLayerVisibility(layerIndex) {
    if (editor.layers[layerIndex]) {
        editor.layers[layerIndex].visible = !editor.layers[layerIndex].visible;
        editor.updateLayersPanel();
    }
}

function showEditMenu() {
    const helpContent = `
        <div style="text-align: left; line-height: 1.6;">
            <h4 style="color: #3498db; margin-bottom: 10px;">📝 編輯功能</h4>
            <p><kbd>Ctrl+Z</kbd> 復原上一步</p>
            <p><kbd>Ctrl+Y</kbd> 重做操作</p>
            <p><kbd>Ctrl+S</kbd> 儲存圖像</p>
            <p><kbd>Ctrl+O</kbd> 開啟檔案</p>
            
            <h4 style="color: #e74c3c; margin: 15px 0 10px 0;">🤖 AI 功能快捷鍵</h4>
            <p><kbd>Alt+W</kbd> AI 去浮水印</p>
            <p><kbd>Alt+T</kbd> AI 去文字</p>
            <p><kbd>Alt+E</kbd> AI 圖像增強</p>
            <p><kbd>Alt+B</kbd> AI 去背景</p>
            <p><kbd>Alt+S</kbd> AI 風格轉換</p>
            
            <h4 style="color: #27ae60; margin: 15px 0 10px 0;">💡 使用提示</h4>
            <p>• 載入圖像後會顯示快速工具欄</p>
            <p>• AI 去浮水印會先顯示檢測預覽</p>
            <p>• 所有 AI 功能都有進度提示</p>
        </div>
    `;
    
    showHelpDialog('快捷鍵與功能說明', helpContent);
}

function showHelpDialog(title, content) {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: #2c2c2c;
        padding: 25px;
        border-radius: 10px;
        max-width: 500px;
        max-height: 80%;
        overflow-y: auto;
        color: white;
        border: 1px solid #444;
    `;
    
    dialogContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #fff;">${title}</h3>
        ${content}
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="closeHelpDialog()" style="padding: 10px 20px; background: #3498db; border: none; border-radius: 5px; color: white; cursor: pointer;">關閉</button>
        </div>
        <style>
            kbd {
                background: #444;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 12px;
                border: 1px solid #666;
            }
        </style>
    `;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    window.currentHelpDialog = dialog;
}

function closeHelpDialog() {
    if (window.currentHelpDialog) {
        document.body.removeChild(window.currentHelpDialog);
        window.currentHelpDialog = null;
    }
}

// Property group toggle functionality
function togglePropertyGroup(titleElement) {
    const propertyGroup = titleElement.parentElement;
    propertyGroup.classList.toggle('collapsed');
}

// Transform functions
function resizeImage() {
    const newWidth = prompt('請輸入新寬度 (像素):', editor.canvas.width);
    const newHeight = prompt('請輸入新高度 (像素):', editor.canvas.height);
    
    if (newWidth && newHeight && !isNaN(newWidth) && !isNaN(newHeight)) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 保存當前圖像
        tempCanvas.width = editor.canvas.width;
        tempCanvas.height = editor.canvas.height;
        tempCtx.drawImage(editor.canvas, 0, 0);
        
        // 調整畫布大小
        editor.canvas.width = parseInt(newWidth);
        editor.canvas.height = parseInt(newHeight);
        
        // 重新繪製圖像
        editor.ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 
                           0, 0, editor.canvas.width, editor.canvas.height);
        
        editor.saveState();
        document.getElementById('canvasInfo').textContent = `${editor.canvas.width} x ${editor.canvas.height} px`;
        aiProcessor.showNotification('圖像大小已調整', 'success');
    }
}

function rotateImage(degrees) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // 保存當前圖像
    tempCanvas.width = editor.canvas.width;
    tempCanvas.height = editor.canvas.height;
    tempCtx.drawImage(editor.canvas, 0, 0);
    
    // 調整畫布尺寸（90度旋轉時寬高互換）
    if (Math.abs(degrees) === 90) {
        const newWidth = editor.canvas.height;
        const newHeight = editor.canvas.width;
        editor.canvas.width = newWidth;
        editor.canvas.height = newHeight;
    }
    
    // 清除畫布
    editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
    
    // 設置旋轉中心點
    editor.ctx.save();
    editor.ctx.translate(editor.canvas.width / 2, editor.canvas.height / 2);
    editor.ctx.rotate(degrees * Math.PI / 180);
    
    // 繪製旋轉後的圖像
    editor.ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    editor.ctx.restore();
    
    editor.saveState();
    document.getElementById('canvasInfo').textContent = `${editor.canvas.width} x ${editor.canvas.height} px`;
    aiProcessor.showNotification(`圖像已旋轉 ${degrees}°`, 'success');
}

function flipImage(direction) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // 保存當前圖像
    tempCanvas.width = editor.canvas.width;
    tempCanvas.height = editor.canvas.height;
    tempCtx.drawImage(editor.canvas, 0, 0);
    
    // 清除畫布
    editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
    
    // 設置翻轉
    editor.ctx.save();
    if (direction === 'horizontal') {
        editor.ctx.scale(-1, 1);
        editor.ctx.drawImage(tempCanvas, -editor.canvas.width, 0);
    } else {
        editor.ctx.scale(1, -1);
        editor.ctx.drawImage(tempCanvas, 0, -editor.canvas.height);
    }
    editor.ctx.restore();
    
    editor.saveState();
    aiProcessor.showNotification(`圖像已${direction === 'horizontal' ? '水平' : '垂直'}翻轉`, 'success');
}

// Color adjustment functions
let colorAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0
};

function adjustColor() {
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const saturation = document.getElementById('saturation').value;
    
    // 更新顯示值
    document.getElementById('brightnessValue').textContent = brightness;
    document.getElementById('contrastValue').textContent = contrast;
    document.getElementById('saturationValue').textContent = saturation;
    
    // 保存調整值
    colorAdjustments.brightness = parseInt(brightness);
    colorAdjustments.contrast = parseInt(contrast);
    colorAdjustments.saturation = parseInt(saturation);
    
    // 應用調整（使用防抖來避免過於頻繁的更新）
    clearTimeout(window.colorAdjustTimeout);
    window.colorAdjustTimeout = setTimeout(() => {
        applyColorAdjustments();
    }, 100);
}

function applyColorAdjustments() {
    if (!editor.history.length) return;
    
    // 從原始圖像開始調整
    const img = new Image();
    img.onload = function() {
        editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
        editor.ctx.drawImage(img, 0, 0);
        
        // 獲取圖像數據
        const imageData = editor.ctx.getImageData(0, 0, editor.canvas.width, editor.canvas.height);
        const data = imageData.data;
        
        // 應用調整
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 亮度調整
            r += colorAdjustments.brightness * 2.55;
            g += colorAdjustments.brightness * 2.55;
            b += colorAdjustments.brightness * 2.55;
            
            // 對比度調整
            const contrastFactor = (259 * (colorAdjustments.contrast + 255)) / (255 * (259 - colorAdjustments.contrast));
            r = contrastFactor * (r - 128) + 128;
            g = contrastFactor * (g - 128) + 128;
            b = contrastFactor * (b - 128) + 128;
            
            // 飽和度調整
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const satFactor = (colorAdjustments.saturation + 100) / 100;
            r = gray + satFactor * (r - gray);
            g = gray + satFactor * (g - gray);
            b = gray + satFactor * (b - gray);
            
            // 限制值範圍
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
        
        editor.ctx.putImageData(imageData, 0, 0);
    };
    img.src = editor.history[0]; // 使用原始圖像
}

function resetColorAdjustments() {
    document.getElementById('brightness').value = 0;
    document.getElementById('contrast').value = 0;
    document.getElementById('saturation').value = 0;
    
    document.getElementById('brightnessValue').textContent = '0';
    document.getElementById('contrastValue').textContent = '0';
    document.getElementById('saturationValue').textContent = '0';
    
    colorAdjustments = { brightness: 0, contrast: 0, saturation: 0 };
    
    // 恢復原始圖像
    if (editor.history.length > 0) {
        const img = new Image();
        img.onload = function() {
            editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
            editor.ctx.drawImage(img, 0, 0);
        };
        img.src = editor.history[0];
    }
    
    aiProcessor.showNotification('色彩調整已重置', 'success');
}

function showFilterMenu() {
    alert('濾鏡功能已整合在右側面板中');
}

function showLayerMenu() {
    alert('圖層功能已整合在右側面板中');
}

// AI 功能實現
class AIProcessor {
    constructor() {
        this.isProcessing = false;
        this.currentProcess = null;
    }

    async removeWatermark() {
        return this.processWithAI('watermark-removal', '正在移除浮水印...', async (imageData) => {
            console.log('開始 AI 浮水印移除處理...');
            
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            console.log(`圖像尺寸: ${width} x ${height}`);
            
            // 創建原始數據的副本
            const originalData = new Uint8ClampedArray(data);
            
            try {
                // 第一步：檢測浮水印區域
                console.log('步驟 1: 檢測浮水印區域...');
                const watermarkMask = this.detectWatermarkRegions(originalData, width, height);
                
                // 統計檢測結果
                const detectedPixels = watermarkMask.filter(Boolean).length;
                const totalPixels = width * height;
                const detectionRate = (detectedPixels / totalPixels * 100).toFixed(2);
                
                console.log(`檢測完成: ${detectedPixels}/${totalPixels} 像素 (${detectionRate}%)`);
                
                if (detectedPixels === 0) {
                    console.log('未檢測到浮水印，返回原圖像');
                    this.showNotification('未檢測到明顯的浮水印', 'info');
                    return imageData;
                }
                
                // 第二步：修復浮水印區域
                console.log('步驟 2: 修復浮水印區域...');
                let repairedCount = 0;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        
                        if (watermarkMask[y * width + x]) {
                            try {
                                // 使用內容感知修復
                                const repairedColor = this.contentAwareRepair(originalData, x, y, width, height);
                                if (repairedColor) {
                                    data[index] = Math.max(0, Math.min(255, repairedColor.r));
                                    data[index + 1] = Math.max(0, Math.min(255, repairedColor.g));
                                    data[index + 2] = Math.max(0, Math.min(255, repairedColor.b));
                                    data[index + 3] = 255;
                                    repairedCount++;
                                }
                            } catch (error) {
                                console.warn(`修復像素 (${x}, ${y}) 時出錯:`, error);
                                // 使用簡單的鄰居平均作為備用
                                const neighbors = this.getNeighborPixels(originalData, x, y, width, height);
                                if (neighbors.length > 0) {
                                    const avgColor = this.averageColor(neighbors);
                                    data[index] = avgColor.r;
                                    data[index + 1] = avgColor.g;
                                    data[index + 2] = avgColor.b;
                                    data[index + 3] = 255;
                                }
                            }
                        }
                    }
                    
                    // 更新進度
                    if (y % Math.floor(height / 10) === 0) {
                        const progress = Math.floor((y / height) * 30) + 60; // 60-90%
                        this.updateProgress(progress, `修復進度: ${Math.floor(y / height * 100)}%`);
                        await this.delay(10); // 讓 UI 有時間更新
                    }
                }
                
                console.log(`修復完成: ${repairedCount} 個像素`);
                
                // 第三步：後處理平滑
                console.log('步驟 3: 後處理平滑...');
                this.smoothRepairRegions(data, watermarkMask, width, height);
                
                console.log('浮水印移除處理完成');
                return imageData;
                
            } catch (error) {
                console.error('浮水印移除過程中發生錯誤:', error);
                this.showNotification('浮水印移除失敗: ' + error.message, 'error');
                return imageData; // 返回原圖像
            }
        });
    }

    // 簡單快速的浮水印移除
    async simpleWatermarkRemoval() {
        return this.processWithAI('simple-watermark-removal', '正在快速移除浮水印...', async (imageData) => {
            console.log('開始簡單浮水印移除...');
            
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            // 簡單的浮水印移除：基於亮度和透明度
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                const brightness = (r + g + b) / 3;
                
                // 移除半透明像素
                if (a < 240) {
                    const x = (i / 4) % width;
                    const y = Math.floor((i / 4) / width);
                    
                    // 使用周圍像素的平均值
                    const neighbors = this.getNeighborPixels(data, x, y, width, height);
                    if (neighbors.length > 0) {
                        const avgColor = this.averageColor(neighbors);
                        data[i] = avgColor.r;
                        data[i + 1] = avgColor.g;
                        data[i + 2] = avgColor.b;
                        data[i + 3] = 255;
                    }
                }
                // 移除過亮或過暗的像素
                else if (brightness > 250 || brightness < 5) {
                    const x = (i / 4) % width;
                    const y = Math.floor((i / 4) / width);
                    
                    const neighbors = this.getNeighborPixels(data, x, y, width, height);
                    if (neighbors.length > 0) {
                        const avgColor = this.averageColor(neighbors);
                        data[i] = avgColor.r;
                        data[i + 1] = avgColor.g;
                        data[i + 2] = avgColor.b;
                    }
                }
            }
            
            console.log('簡單浮水印移除完成');
            return imageData;
        });
    }

    // AI 文字移除功能
    async removeText() {
        return this.processWithAI('text-removal', '正在移除文字...', async (imageData) => {
            console.log('開始 AI 文字移除處理...');
            
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            // 創建原始數據的副本
            const originalData = new Uint8ClampedArray(data);
            
            try {
                // 第一步：檢測文字區域
                console.log('步驟 1: 檢測文字區域...');
                const textMask = this.detectTextRegions(originalData, width, height);
                
                // 統計檢測結果
                const detectedPixels = textMask.filter(Boolean).length;
                const totalPixels = width * height;
                const detectionRate = (detectedPixels / totalPixels * 100).toFixed(2);
                
                console.log(`文字檢測完成: ${detectedPixels}/${totalPixels} 像素 (${detectionRate}%)`);
                
                if (detectedPixels === 0) {
                    console.log('未檢測到文字，返回原圖像');
                    this.showNotification('未檢測到明顯的文字', 'info');
                    return imageData;
                }
                
                // 第二步：修復文字區域
                console.log('步驟 2: 修復文字區域...');
                let repairedCount = 0;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        
                        if (textMask[y * width + x]) {
                            try {
                                // 使用內容感知修復
                                const repairedColor = this.contentAwareRepair(originalData, x, y, width, height);
                                if (repairedColor) {
                                    data[index] = Math.max(0, Math.min(255, repairedColor.r));
                                    data[index + 1] = Math.max(0, Math.min(255, repairedColor.g));
                                    data[index + 2] = Math.max(0, Math.min(255, repairedColor.b));
                                    data[index + 3] = 255;
                                    repairedCount++;
                                }
                            } catch (error) {
                                console.warn(`修復文字像素 (${x}, ${y}) 時出錯:`, error);
                                // 使用簡單的鄰居平均作為備用
                                const neighbors = this.getNeighborPixels(originalData, x, y, width, height);
                                if (neighbors.length > 0) {
                                    const avgColor = this.averageColor(neighbors);
                                    data[index] = avgColor.r;
                                    data[index + 1] = avgColor.g;
                                    data[index + 2] = avgColor.b;
                                    data[index + 3] = 255;
                                }
                            }
                        }
                    }
                    
                    // 更新進度
                    if (y % Math.floor(height / 10) === 0) {
                        const progress = Math.floor((y / height) * 30) + 60; // 60-90%
                        this.updateProgress(progress, `修復進度: ${Math.floor(y / height * 100)}%`);
                        await this.delay(10);
                    }
                }
                
                console.log(`文字修復完成: ${repairedCount} 個像素`);
                
                // 第三步：後處理平滑
                console.log('步驟 3: 後處理平滑...');
                this.smoothRepairRegions(data, textMask, width, height);
                
                console.log('文字移除處理完成');
                return imageData;
                
            } catch (error) {
                console.error('文字移除過程中發生錯誤:', error);
                this.showNotification('文字移除失敗: ' + error.message, 'error');
                return imageData;
            }
        });
    }

    // 檢測文字區域
    detectTextRegions(data, width, height) {
        const mask = new Array(width * height).fill(false);
        let detectedCount = 0;
        
        console.log('開始檢測文字區域...');
        
        for (let y = 3; y < height - 3; y++) {
            for (let x = 3; x < width - 3; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                let isText = false;
                let detectionReasons = [];
                
                // 檢測1：高對比度邊緣（文字特徵）
                if (this.hasTextLikeEdges(data, x, y, width, height)) {
                    isText = true;
                    detectionReasons.push('文字邊緣');
                }
                
                // 檢測2：線條結構檢測
                if (this.hasLineStructure(data, x, y, width, height)) {
                    isText = true;
                    detectionReasons.push('線條結構');
                }
                
                // 檢測3：字符形狀檢測
                if (this.hasCharacterShape(data, x, y, width, height)) {
                    isText = true;
                    detectionReasons.push('字符形狀');
                }
                
                // 檢測4：顏色一致性（文字通常顏色一致）
                if (this.hasConsistentTextColor(data, x, y, width, height)) {
                    isText = true;
                    detectionReasons.push('顏色一致');
                }
                
                // 檢測5：筆劃寬度檢測
                if (this.hasStrokeWidth(data, x, y, width, height)) {
                    isText = true;
                    detectionReasons.push('筆劃寬度');
                }
                
                if (isText) {
                    mask[y * width + x] = true;
                    detectedCount++;
                    
                    // 調試信息
                    if (detectedCount <= 5) {
                        console.log(`檢測到文字像素 (${x}, ${y}): ${detectionReasons.join(', ')}`);
                    }
                }
            }
        }
        
        console.log(`總共檢測到 ${detectedCount} 個文字像素`);
        
        // 形態學操作：連接文字區域
        return this.morphologyTextCleanup(mask, width, height);
    }

    // 檢測文字類邊緣
    hasTextLikeEdges(data, x, y, width, height) {
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 檢查8個方向的對比度
        let strongEdges = 0;
        let edgeDirections = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (let i = 0; i < directions.length; i++) {
            const [dx, dy] = directions[i];
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const contrast = Math.abs(centerBrightness - brightness);
                
                if (contrast > 80) {
                    strongEdges++;
                    edgeDirections.push(i);
                }
            }
        }
        
        // 文字通常有2-4個強邊緣，且分布相對均勻
        return strongEdges >= 2 && strongEdges <= 5;
    }

    // 檢測線條結構
    hasLineStructure(data, x, y, width, height) {
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 檢查水平和垂直線條
        let horizontalLine = 0;
        let verticalLine = 0;
        
        // 水平線檢測
        for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            if (nx >= 0 && nx < width) {
                const idx = (y * width + nx) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (Math.abs(brightness - centerBrightness) < 30) {
                    horizontalLine++;
                }
            }
        }
        
        // 垂直線檢測
        for (let dy = -2; dy <= 2; dy++) {
            const ny = y + dy;
            if (ny >= 0 && ny < height) {
                const idx = (ny * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (Math.abs(brightness - centerBrightness) < 30) {
                    verticalLine++;
                }
            }
        }
        
        // 如果有明顯的水平或垂直線條，可能是文字
        return horizontalLine >= 3 || verticalLine >= 3;
    }

    // 檢測字符形狀
    hasCharacterShape(data, x, y, width, height) {
        // 檢測是否有封閉或半封閉的形狀（如字母 O, P, B 等）
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 檢查3x3區域內的亮度變化模式
        let pattern = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const idx = (ny * width + nx) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    pattern.push(Math.abs(brightness - centerBrightness) < 40 ? 1 : 0);
                } else {
                    pattern.push(0);
                }
            }
        }
        
        // 檢查是否有文字特徵的模式
        const textPatterns = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1], // 實心區域
            [0, 1, 0, 1, 1, 1, 0, 1, 0], // 十字形
            [1, 1, 1, 1, 0, 1, 1, 1, 1], // 中空
            [1, 0, 1, 0, 1, 0, 1, 0, 1], // 點狀
        ];
        
        for (const textPattern of textPatterns) {
            let matches = 0;
            for (let i = 0; i < 9; i++) {
                if (pattern[i] === textPattern[i]) matches++;
            }
            if (matches >= 6) return true;
        }
        
        return false;
    }

    // 檢測顏色一致性
    hasConsistentTextColor(data, x, y, width, height) {
        const colors = [];
        const radius = 2;
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const idx = (ny * width + nx) * 4;
                    colors.push({
                        r: data[idx],
                        g: data[idx + 1],
                        b: data[idx + 2]
                    });
                }
            }
        }
        
        if (colors.length === 0) return false;
        
        // 計算顏色方差
        const variance = this.calculateColorVariance(colors);
        
        // 文字區域顏色方差應該較小
        return variance < 200;
    }

    // 檢測筆劃寬度
    hasStrokeWidth(data, x, y, width, height) {
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 檢測水平筆劃寬度
        let leftWidth = 0, rightWidth = 0;
        
        // 向左檢測
        for (let dx = -1; dx >= -5; dx--) {
            const nx = x + dx;
            if (nx >= 0) {
                const idx = (y * width + nx) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (Math.abs(brightness - centerBrightness) < 40) {
                    leftWidth++;
                } else {
                    break;
                }
            }
        }
        
        // 向右檢測
        for (let dx = 1; dx <= 5; dx++) {
            const nx = x + dx;
            if (nx < width) {
                const idx = (y * width + nx) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (Math.abs(brightness - centerBrightness) < 40) {
                    rightWidth++;
                } else {
                    break;
                }
            }
        }
        
        const totalWidth = leftWidth + rightWidth + 1;
        
        // 文字筆劃寬度通常在2-8像素之間
        return totalWidth >= 2 && totalWidth <= 8;
    }

    // 文字區域形態學清理
    morphologyTextCleanup(mask, width, height) {
        console.log('開始文字區域形態學清理...');
        
        // 第一步：連接相近的文字像素
        const connected = new Array(width * height).fill(false);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                if (mask[index]) {
                    connected[index] = true;
                    
                    // 連接附近的文字像素
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIndex = (y + dy) * width + (x + dx);
                            if (nIndex >= 0 && nIndex < mask.length && mask[nIndex]) {
                                connected[nIndex] = true;
                            }
                        }
                    }
                }
            }
        }
        
        // 第二步：移除孤立點
        const cleaned = new Array(width * height).fill(false);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                if (connected[index]) {
                    // 檢查周圍是否有足夠的鄰居
                    let neighborCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nIndex = (y + dy) * width + (x + dx);
                            if (nIndex >= 0 && nIndex < connected.length && connected[nIndex]) {
                                neighborCount++;
                            }
                        }
                    }
                    
                    // 保留有足夠鄰居的像素
                    if (neighborCount >= 1) {
                        cleaned[index] = true;
                    }
                }
            }
        }
        
        const originalCount = mask.filter(Boolean).length;
        const cleanedCount = cleaned.filter(Boolean).length;
        console.log(`文字區域清理完成: ${originalCount} -> ${cleanedCount} 像素`);
        
        return cleaned;
    }

    // 簡單快速的文字移除
    async simpleTextRemoval() {
        return this.processWithAI('simple-text-removal', '正在快速移除文字...', async (imageData) => {
            console.log('開始簡單文字移除...');
            
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            // 簡單的文字移除：基於高對比度邊緣檢測
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    const brightness = (r + g + b) / 3;
                    
                    // 檢測高對比度邊緣（可能是文字）
                    let hasHighContrast = false;
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nIndex = (ny * width + nx) * 4;
                            const nBrightness = (data[nIndex] + data[nIndex + 1] + data[nIndex + 2]) / 3;
                            const contrast = Math.abs(brightness - nBrightness);
                            
                            if (contrast > 100) {
                                hasHighContrast = true;
                                break;
                            }
                        }
                    }
                    
                    // 如果檢測到高對比度，且是極端亮度（黑色或白色文字）
                    if (hasHighContrast && (brightness < 50 || brightness > 200)) {
                        // 使用周圍像素的平均值替換
                        const neighbors = this.getNeighborPixels(data, x, y, width, height);
                        if (neighbors.length > 0) {
                            const avgColor = this.averageColor(neighbors);
                            data[index] = avgColor.r;
                            data[index + 1] = avgColor.g;
                            data[index + 2] = avgColor.b;
                        }
                    }
                }
            }
            
            console.log('簡單文字移除完成');
            return imageData;
        });
    }

    // 檢測浮水印區域的增強算法
    detectWatermarkRegions(data, width, height) {
        const mask = new Array(width * height).fill(false);
        let detectedCount = 0;
        
        console.log('開始檢測浮水印區域...');
        
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                let isWatermark = false;
                let detectionReasons = [];
                
                // 檢測1：半透明像素（針對透明浮水印）
                if (a < 240 && a > 10) {
                    isWatermark = true;
                    detectionReasons.push('半透明');
                }
                
                // 檢測2：異常亮度（過亮或過暗的像素）
                const brightness = (r + g + b) / 3;
                if (brightness > 250 || brightness < 5) {
                    isWatermark = true;
                    detectionReasons.push('異常亮度');
                }
                
                // 檢測3：顏色異常（與周圍差異過大）
                const neighbors = this.getNeighborPixels(data, x, y, width, height);
                if (neighbors.length > 0) {
                    const avgNeighbor = this.averageColor(neighbors);
                    const colorDiff = Math.abs(r - avgNeighbor.r) + 
                                    Math.abs(g - avgNeighbor.g) + 
                                    Math.abs(b - avgNeighbor.b);
                    
                    // 降低閾值，使檢測更精確
                    if (colorDiff > 120) {
                        // 進一步檢查是否真的是異常
                        const variance = this.calculateColorVariance(neighbors);
                        if (variance < 50) { // 周圍顏色相對均勻，但當前像素差異大
                            isWatermark = true;
                            detectionReasons.push('顏色異常');
                        }
                    }
                }
                
                // 檢測4：重複圖案檢測（降低敏感度）
                if (this.isRepeatingPattern(data, x, y, width, height)) {
                    isWatermark = true;
                    detectionReasons.push('重複圖案');
                }
                
                // 檢測5：邊緣異常（調整參數）
                if (this.hasAbnormalEdges(data, x, y, width, height)) {
                    isWatermark = true;
                    detectionReasons.push('邊緣異常');
                }
                
                // 檢測6：文字特徵檢測
                if (this.hasTextFeatures(data, x, y, width, height)) {
                    isWatermark = true;
                    detectionReasons.push('文字特徵');
                }
                
                if (isWatermark) {
                    mask[y * width + x] = true;
                    detectedCount++;
                    
                    // 調試信息（僅顯示前幾個檢測結果）
                    if (detectedCount <= 5) {
                        console.log(`檢測到浮水印像素 (${x}, ${y}): ${detectionReasons.join(', ')}`);
                    }
                }
            }
        }
        
        console.log(`總共檢測到 ${detectedCount} 個浮水印像素`);
        
        // 如果檢測到的像素太少，可能是檢測失敗
        if (detectedCount < 10) {
            console.log('檢測到的浮水印像素太少，嘗試降低檢測閾值...');
            return this.detectWatermarkRegionsLowThreshold(data, width, height);
        }
        
        // 形態學操作：清理檢測結果
        return this.morphologyCleanup(mask, width, height);
    }

    // 低閾值檢測（當標準檢測失敗時使用）
    detectWatermarkRegionsLowThreshold(data, width, height) {
        const mask = new Array(width * height).fill(false);
        let detectedCount = 0;
        
        console.log('使用低閾值檢測模式...');
        
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                let isWatermark = false;
                
                // 更寬鬆的檢測條件
                const brightness = (r + g + b) / 3;
                
                // 檢測半透明
                if (a < 250 && a > 5) {
                    isWatermark = true;
                }
                
                // 檢測極端亮度
                if (brightness > 245 || brightness < 10) {
                    isWatermark = true;
                }
                
                // 檢測顏色差異（降低閾值）
                const neighbors = this.getNeighborPixels(data, x, y, width, height);
                if (neighbors.length > 0) {
                    const avgNeighbor = this.averageColor(neighbors);
                    const colorDiff = Math.abs(r - avgNeighbor.r) + 
                                    Math.abs(g - avgNeighbor.g) + 
                                    Math.abs(b - avgNeighbor.b);
                    
                    if (colorDiff > 80) {
                        isWatermark = true;
                    }
                }
                
                if (isWatermark) {
                    mask[y * width + x] = true;
                    detectedCount++;
                }
            }
        }
        
        console.log(`低閾值模式檢測到 ${detectedCount} 個浮水印像素`);
        
        return this.morphologyCleanup(mask, width, height);
    }

    // 計算顏色方差
    calculateColorVariance(colors) {
        if (colors.length === 0) return 0;
        
        const avg = this.averageColor(colors);
        let variance = 0;
        
        for (const color of colors) {
            const diff = Math.abs(color.r - avg.r) + Math.abs(color.g - avg.g) + Math.abs(color.b - avg.b);
            variance += diff * diff;
        }
        
        return variance / colors.length;
    }

    // 檢測文字特徵
    hasTextFeatures(data, x, y, width, height) {
        // 檢測是否有文字的特徵（高對比度邊緣）
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 檢查周圍8個方向的對比度
        let highContrastCount = 0;
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const contrast = Math.abs(centerBrightness - brightness);
                
                if (contrast > 100) {
                    highContrastCount++;
                }
            }
        }
        
        // 如果有多個方向都有高對比度，可能是文字邊緣
        return highContrastCount >= 3;
    }

    // 內容感知修復
    contentAwareRepair(data, x, y, width, height) {
        // 首先嘗試簡單的鄰居平均法
        const neighbors = this.getNeighborPixels(data, x, y, width, height);
        if (neighbors.length > 0) {
            const avgColor = this.averageColor(neighbors);
            
            // 檢查平均顏色是否合理
            const brightness = (avgColor.r + avgColor.g + avgColor.b) / 3;
            if (brightness > 5 && brightness < 250) {
                return avgColor;
            }
        }
        
        // 如果簡單方法失敗，使用更複雜的搜索
        const searchRadius = 20;
        const patchSize = 3; // 減小補丁大小以提高性能
        let bestMatch = null;
        let bestScore = Infinity;
        
        // 在搜索半徑內尋找最佳匹配區域
        for (let sy = Math.max(patchSize, y - searchRadius); 
             sy < Math.min(height - patchSize, y + searchRadius); sy += 2) { // 跳躍搜索以提高性能
            for (let sx = Math.max(patchSize, x - searchRadius); 
                 sx < Math.min(width - patchSize, x + searchRadius); sx += 2) {
                
                // 跳過當前位置附近
                if (Math.abs(sx - x) < patchSize * 2 && Math.abs(sy - y) < patchSize * 2) {
                    continue;
                }
                
                // 計算匹配分數
                const score = this.calculatePatchSimilarity(data, x, y, sx, sy, patchSize, width, height);
                
                if (score < bestScore) {
                    bestScore = score;
                    bestMatch = { x: sx, y: sy };
                }
            }
        }
        
        if (bestMatch && bestScore < 100) { // 只使用好的匹配
            const index = (bestMatch.y * width + bestMatch.x) * 4;
            return {
                r: data[index],
                g: data[index + 1],
                b: data[index + 2]
            };
        }
        
        // 最後的備用方案：使用更大範圍的鄰居平均
        const largeNeighbors = this.getLargeNeighborPixels(data, x, y, width, height, 4);
        if (largeNeighbors.length > 0) {
            return this.averageColor(largeNeighbors);
        }
        
        // 如果所有方法都失敗，返回中性灰色
        return { r: 128, g: 128, b: 128 };
    }

    // 獲取更大範圍的鄰居像素
    getLargeNeighborPixels(data, x, y, width, height, radius) {
        const neighbors = [];
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !(dx === 0 && dy === 0)) {
                    const index = (ny * width + nx) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    // 過濾掉可能的浮水印像素
                    const brightness = (r + g + b) / 3;
                    if (brightness > 10 && brightness < 245) {
                        neighbors.push({ r, g, b });
                    }
                }
            }
        }
        
        return neighbors;
    }

    // 計算圖像塊相似度
    calculatePatchSimilarity(data, x1, y1, x2, y2, patchSize, width, height) {
        let totalDiff = 0;
        let count = 0;
        
        for (let dy = -patchSize; dy <= patchSize; dy++) {
            for (let dx = -patchSize; dx <= patchSize; dx++) {
                const px1 = x1 + dx, py1 = y1 + dy;
                const px2 = x2 + dx, py2 = y2 + dy;
                
                if (px1 >= 0 && px1 < width && py1 >= 0 && py1 < height &&
                    px2 >= 0 && px2 < width && py2 >= 0 && py2 < height) {
                    
                    const idx1 = (py1 * width + px1) * 4;
                    const idx2 = (py2 * width + px2) * 4;
                    
                    const diff = Math.abs(data[idx1] - data[idx2]) +
                               Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                               Math.abs(data[idx1 + 2] - data[idx2 + 2]);
                    
                    totalDiff += diff;
                    count++;
                }
            }
        }
        
        return count > 0 ? totalDiff / count : Infinity;
    }

    // 檢測重複圖案
    isRepeatingPattern(data, x, y, width, height) {
        const patternSize = 8;
        if (x < patternSize || y < patternSize || 
            x >= width - patternSize || y >= height - patternSize) {
            return false;
        }
        
        // 檢查水平重複
        let horizontalSimilarity = 0;
        for (let dx = 1; dx <= 3; dx++) {
            const similarity = this.calculatePatchSimilarity(
                data, x, y, x + patternSize * dx, y, patternSize / 2, width, height
            );
            if (similarity < 30) horizontalSimilarity++;
        }
        
        // 檢查垂直重複
        let verticalSimilarity = 0;
        for (let dy = 1; dy <= 3; dy++) {
            const similarity = this.calculatePatchSimilarity(
                data, x, y, x, y + patternSize * dy, patternSize / 2, width, height
            );
            if (similarity < 30) verticalSimilarity++;
        }
        
        return horizontalSimilarity >= 2 || verticalSimilarity >= 2;
    }

    // 檢測邊緣異常
    hasAbnormalEdges(data, x, y, width, height) {
        if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) {
            return false;
        }
        
        const center = (y * width + x) * 4;
        const centerBrightness = (data[center] + data[center + 1] + data[center + 2]) / 3;
        
        // 計算梯度
        const gradients = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            gradients.push(Math.abs(centerBrightness - brightness));
        }
        
        const maxGradient = Math.max(...gradients);
        const avgGradient = gradients.reduce((a, b) => a + b) / gradients.length;
        
        // 如果最大梯度遠大於平均梯度，可能是浮水印邊緣
        return maxGradient > avgGradient * 3 && maxGradient > 50;
    }

    // 形態學清理
    morphologyCleanup(mask, width, height) {
        console.log('開始形態學清理...');
        
        // 第一步：移除孤立點（腐蝕操作）
        const eroded = new Array(width * height).fill(false);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                if (mask[index]) {
                    // 檢查周圍是否也有浮水印像素
                    let neighborCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nIndex = (y + dy) * width + (x + dx);
                            if (nIndex >= 0 && nIndex < mask.length && mask[nIndex]) {
                                neighborCount++;
                            }
                        }
                    }
                    // 只保留有足夠鄰居的像素
                    if (neighborCount >= 2) {
                        eroded[index] = true;
                    }
                }
            }
        }
        
        // 第二步：輕微膨脹操作（連接相近的區域）
        const cleaned = new Array(width * height).fill(false);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                if (eroded[index]) {
                    cleaned[index] = true;
                    // 輕微膨脹（只膨脹直接相鄰的像素）
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (const [dx, dy] of directions) {
                        const nIndex = (y + dy) * width + (x + dx);
                        if (nIndex >= 0 && nIndex < mask.length) {
                            cleaned[nIndex] = true;
                        }
                    }
                }
            }
        }
        
        // 統計清理結果
        const originalCount = mask.filter(Boolean).length;
        const cleanedCount = cleaned.filter(Boolean).length;
        console.log(`形態學清理完成: ${originalCount} -> ${cleanedCount} 像素`);
        
        return cleaned;
    }

    // 平滑修復區域
    smoothRepairRegions(data, mask, width, height) {
        const smoothed = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = (y * width + x) * 4;
                
                if (mask[y * width + x]) {
                    // 對修復區域進行高斯模糊
                    let r = 0, g = 0, b = 0, count = 0;
                    
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIndex = ((y + dy) * width + (x + dx)) * 4;
                            const weight = dx === 0 && dy === 0 ? 4 : (Math.abs(dx) + Math.abs(dy) === 1 ? 2 : 1);
                            
                            r += data[nIndex] * weight;
                            g += data[nIndex + 1] * weight;
                            b += data[nIndex + 2] * weight;
                            count += weight;
                        }
                    }
                    
                    smoothed[index] = r / count;
                    smoothed[index + 1] = g / count;
                    smoothed[index + 2] = b / count;
                }
            }
        }
        
        // 將平滑結果複製回原數據
        for (let i = 0; i < data.length; i++) {
            data[i] = smoothed[i];
        }
    }

    async applyStyleTransfer(style) {
        const styleNames = {
            'comic': '漫畫風格',
            'movie': '電影風格',
            'anime': '動漫風格',
            'oil-painting': '油畫風格',
            'sketch': '素描風格',
            'cyberpunk': '賽博朋克風格'
        };

        return this.processWithAI('style-transfer', `正在轉換為${styleNames[style]}...`, async (imageData) => {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;

            switch (style) {
                case 'comic':
                    return this.applyComicStyle(imageData);
                case 'movie':
                    return this.applyMovieStyle(imageData);
                case 'anime':
                    return this.applyAnimeStyle(imageData);
                case 'oil-painting':
                    return this.applyOilPaintingStyle(imageData);
                case 'sketch':
                    return this.applySketchStyle(imageData);
                case 'cyberpunk':
                    return this.applyCyberpunkStyle(imageData);
                default:
                    return imageData;
            }
        });
    }

    async enhanceImage() {
        return this.processWithAI('image-enhancement', '正在增強圖像品質...', async (imageData) => {
            const data = imageData.data;
            
            // 增強對比度和清晰度
            for (let i = 0; i < data.length; i += 4) {
                // 增強對比度
                data[i] = this.enhanceContrast(data[i]);
                data[i + 1] = this.enhanceContrast(data[i + 1]);
                data[i + 2] = this.enhanceContrast(data[i + 2]);
                
                // 色彩飽和度增強
                const hsl = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);
                hsl.s = Math.min(1, hsl.s * 1.2);
                const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
                
                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }

            return imageData;
        });
    }

    async removeBackground() {
        return this.processWithAI('background-removal', '正在移除背景...', async (imageData) => {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;

            // 簡單的背景移除算法（基於邊緣檢測）
            const edges = this.detectEdges(imageData);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    
                    // 如果是邊緣附近的像素，保留
                    if (edges[index / 4]) {
                        continue;
                    }
                    
                    // 檢查是否為背景色（通常是邊緣的顏色）
                    if (this.isBackgroundPixel(data, index, width, height)) {
                        data[index + 3] = 0; // 設為透明
                    }
                }
            }

            return imageData;
        });
    }

    async processWithAI(processType, message, processor) {
        if (this.isProcessing) {
            this.showNotification('AI 正在處理中，請稍候...', 'warning');
            return;
        }

        // 檢查是否有圖像
        if (!editor.canvas.width || !editor.canvas.height) {
            this.showNotification('請先載入圖像再使用 AI 功能', 'error');
            return;
        }

        this.isProcessing = true;
        this.showAIModal(message);

        try {
            // 獲取當前畫布數據
            const imageData = editor.ctx.getImageData(0, 0, editor.canvas.width, editor.canvas.height);
            
            // 更新進度：分析圖像
            this.updateProgress(20, '分析圖像結構...');
            await this.delay(500);
            
            // 更新進度：AI 處理
            this.updateProgress(60, '執行 AI 算法...');
            
            // 執行處理
            const processedData = await processor(imageData);
            
            // 更新進度：應用結果
            this.updateProgress(90, '應用處理結果...');
            await this.delay(300);
            
            // 應用處理結果
            editor.ctx.putImageData(processedData, 0, 0);
            editor.saveState();
            
            // 完成
            this.updateProgress(100, '處理完成！');
            await this.delay(500);
            
            this.hideAIModal();
            this.showNotification('AI 處理完成！', 'success');
            
        } catch (error) {
            console.error('AI 處理錯誤:', error);
            this.hideAIModal();
            this.showNotification('AI 處理失敗，請重試', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    updateProgress(percentage, message) {
        const progressBar = document.getElementById('aiProgressBar');
        const text = document.getElementById('aiModalText');
        
        progressBar.style.width = percentage + '%';
        text.textContent = message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加樣式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // 設置顏色
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // 動畫顯示
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自動隱藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showAIModal(message) {
        const modal = document.getElementById('aiModal');
        const text = document.getElementById('aiModalText');
        const progressBar = document.getElementById('aiProgressBar');
        
        text.textContent = message;
        progressBar.style.width = '0%';
        modal.style.display = 'flex';
    }

    hideAIModal() {
        const modal = document.getElementById('aiModal');
        modal.style.display = 'none';
    }

    async simulateProcessing() {
        const progressBar = document.getElementById('aiProgressBar');
        
        for (let i = 0; i <= 100; i += 5) {
            progressBar.style.width = i + '%';
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 風格轉換算法
    applyComicStyle(imageData) {
        const data = imageData.data;
        
        // 漫畫風格：增強邊緣，減少顏色層次
        for (let i = 0; i < data.length; i += 4) {
            // 量化顏色
            data[i] = Math.floor(data[i] / 64) * 64;
            data[i + 1] = Math.floor(data[i + 1] / 64) * 64;
            data[i + 2] = Math.floor(data[i + 2] / 64) * 64;
            
            // 增強對比度
            data[i] = this.enhanceContrast(data[i]);
            data[i + 1] = this.enhanceContrast(data[i + 1]);
            data[i + 2] = this.enhanceContrast(data[i + 2]);
        }
        
        return imageData;
    }

    applyMovieStyle(imageData) {
        const data = imageData.data;
        
        // 電影風格：藍橙色調，增加對比度
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 藍橙色調調整
            data[i] = Math.min(255, r * 1.1 + b * 0.1);
            data[i + 1] = g * 0.9;
            data[i + 2] = Math.min(255, b * 1.2 + r * 0.1);
        }
        
        return imageData;
    }

    applyAnimeStyle(imageData) {
        const data = imageData.data;
        
        // 動漫風格：柔和色彩，高飽和度
        for (let i = 0; i < data.length; i += 4) {
            const hsl = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);
            
            // 增加飽和度
            hsl.s = Math.min(1, hsl.s * 1.3);
            // 稍微提亮
            hsl.l = Math.min(1, hsl.l * 1.1);
            
            const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
        }
        
        return imageData;
    }

    applyOilPaintingStyle(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const newData = new Uint8ClampedArray(data);
        
        // 油畫效果：模糊和紋理
        const radius = 3;
        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const index = ((y + dy) * width + (x + dx)) * 4;
                        r += data[index];
                        g += data[index + 1];
                        b += data[index + 2];
                        count++;
                    }
                }
                
                const index = (y * width + x) * 4;
                newData[index] = r / count;
                newData[index + 1] = g / count;
                newData[index + 2] = b / count;
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = newData[i];
        }
        
        return imageData;
    }

    applySketchStyle(imageData) {
        const data = imageData.data;
        
        // 素描風格：轉為灰階並增強邊緣
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const enhanced = this.enhanceContrast(gray);
            
            data[i] = enhanced;
            data[i + 1] = enhanced;
            data[i + 2] = enhanced;
        }
        
        return imageData;
    }

    applyCyberpunkStyle(imageData) {
        const data = imageData.data;
        
        // 賽博朋克風格：紫紅和青色調
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 賽博朋克色調
            data[i] = Math.min(255, r * 1.2 + b * 0.3);
            data[i + 1] = g * 0.8 + r * 0.1;
            data[i + 2] = Math.min(255, b * 1.3 + r * 0.2);
        }
        
        return imageData;
    }

    // 輔助函數
    getNeighborPixels(data, x, y, width, height) {
        const neighbors = [];
        const radius = 2;
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !(dx === 0 && dy === 0)) {
                    const index = (ny * width + nx) * 4;
                    neighbors.push({
                        r: data[index],
                        g: data[index + 1],
                        b: data[index + 2]
                    });
                }
            }
        }
        
        return neighbors;
    }

    averageColor(colors) {
        const sum = colors.reduce((acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b
        }), { r: 0, g: 0, b: 0 });
        
        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    }

    enhanceContrast(value) {
        return Math.min(255, Math.max(0, (value - 128) * 1.5 + 128));
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h, s, l };
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    detectEdges(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const edges = new Array(width * height).fill(false);
        
        // 簡單的邊緣檢測
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = (y * width + x) * 4;
                const current = data[index] + data[index + 1] + data[index + 2];
                
                const neighbors = [
                    data[((y-1) * width + x) * 4] + data[((y-1) * width + x) * 4 + 1] + data[((y-1) * width + x) * 4 + 2],
                    data[(y * width + (x+1)) * 4] + data[(y * width + (x+1)) * 4 + 1] + data[(y * width + (x+1)) * 4 + 2],
                    data[((y+1) * width + x) * 4] + data[((y+1) * width + x) * 4 + 1] + data[((y+1) * width + x) * 4 + 2],
                    data[(y * width + (x-1)) * 4] + data[(y * width + (x-1)) * 4 + 1] + data[(y * width + (x-1)) * 4 + 2]
                ];
                
                const maxDiff = Math.max(...neighbors.map(n => Math.abs(current - n)));
                edges[y * width + x] = maxDiff > 100;
            }
        }
        
        return edges;
    }

    isBackgroundPixel(data, index, width, height) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // 簡單的背景檢測（假設背景是相對均勻的顏色）
        const brightness = (r + g + b) / 3;
        return brightness > 200 || brightness < 50;
    }
}

// 創建 AI 處理器實例
const aiProcessor = new AIProcessor();

// AI 功能的全域函數
function removeWatermark() {
    // 檢查是否跳過預覽
    const skipPreview = localStorage.getItem('skipWatermarkPreview') === 'true';
    
    if (skipPreview) {
        // 直接執行移除
        aiProcessor.removeWatermark();
    } else {
        // 先顯示檢測預覽
        showWatermarkPreview();
    }
}

function showWatermarkPreview() {
    if (!editor.canvas.width || !editor.canvas.height) {
        aiProcessor.showNotification('請先載入圖像', 'error');
        return;
    }
    
    const imageData = editor.ctx.getImageData(0, 0, editor.canvas.width, editor.canvas.height);
    const mask = aiProcessor.detectWatermarkRegions(imageData.data, imageData.width, imageData.height);
    
    // 創建預覽畫布
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = imageData.width;
    previewCanvas.height = imageData.height;
    const previewCtx = previewCanvas.getContext('2d');
    
    // 繪製原圖
    previewCtx.putImageData(imageData, 0, 0);
    
    // 高亮檢測到的浮水印區域
    const highlightData = previewCtx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
            const pixelIndex = i * 4;
            // 添加紅色高亮
            highlightData.data[pixelIndex] = Math.min(255, highlightData.data[pixelIndex] + 100);
            highlightData.data[pixelIndex + 1] = Math.max(0, highlightData.data[pixelIndex + 1] - 50);
            highlightData.data[pixelIndex + 2] = Math.max(0, highlightData.data[pixelIndex + 2] - 50);
            highlightData.data[pixelIndex + 3] = 200; // 半透明
        }
    }
    previewCtx.putImageData(highlightData, 0, 0);
    
    // 顯示預覽對話框
    showWatermarkDialog(previewCanvas.toDataURL());
}

function showWatermarkDialog(previewDataUrl) {
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #2c2c2c;
        padding: 25px;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        color: white;
        border: 1px solid #444;
    `;
    
    content.innerHTML = `
        <h3 style="margin-bottom: 15px;">🔍 浮水印檢測預覽</h3>
        <p style="margin-bottom: 15px; color: #ccc;">紅色區域為檢測到的可能浮水印位置</p>
        <div style="margin-bottom: 20px; max-height: 400px; overflow: auto;">
            <img src="${previewDataUrl}" style="max-width: 100%; border: 1px solid #555; border-radius: 5px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 14px;">
                <input type="checkbox" id="skipPreview" style="margin-right: 8px;">
                下次直接移除，不顯示預覽
            </label>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="confirmWatermarkRemoval()" style="padding: 12px 24px; background: #e74c3c; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">✅ 智能移除</button>
            <button onclick="simpleWatermarkRemoval()" style="padding: 12px 24px; background: #f39c12; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">⚡ 快速移除</button>
            <button onclick="closeWatermarkDialog()" style="padding: 12px 24px; background: #95a5a6; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">❌ 取消</button>
        </div>
        <div style="margin-top: 15px; font-size: 12px; color: #888; line-height: 1.4;">
            <p><strong>智能移除</strong>：使用 AI 算法精確檢測和修復</p>
            <p><strong>快速移除</strong>：簡單快速，適合輕微浮水印</p>
        </div>
    `;
    
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    
    // 存儲對話框引用
    window.currentWatermarkDialog = dialog;
}

function confirmWatermarkRemoval() {
    // 檢查是否要跳過預覽
    const skipPreview = document.getElementById('skipPreview')?.checked;
    if (skipPreview) {
        localStorage.setItem('skipWatermarkPreview', 'true');
    }
    
    closeWatermarkDialog();
    aiProcessor.removeWatermark();
}

function simpleWatermarkRemoval() {
    closeWatermarkDialog();
    aiProcessor.simpleWatermarkRemoval();
}

function closeWatermarkDialog() {
    if (window.currentWatermarkDialog) {
        document.body.removeChild(window.currentWatermarkDialog);
        window.currentWatermarkDialog = null;
    }
}

function showStyleMenu() {
    const styleOptions = document.getElementById('styleOptions');
    
    // 展開風格選擇面板
    if (styleOptions.classList.contains('collapsed')) {
        styleOptions.classList.remove('collapsed');
        
        // 滾動到該區域
        styleOptions.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        aiProcessor.showNotification('請選擇想要的藝術風格', 'info');
    } else {
        styleOptions.classList.add('collapsed');
    }
}

function removeText() {
    // 檢查是否跳過預覽
    const skipPreview = localStorage.getItem('skipTextPreview') === 'true';
    
    if (skipPreview) {
        // 直接執行移除
        aiProcessor.removeText();
    } else {
        // 先顯示檢測預覽
        showTextPreview();
    }
}

function showTextPreview() {
    if (!editor.canvas.width || !editor.canvas.height) {
        aiProcessor.showNotification('請先載入圖像', 'error');
        return;
    }
    
    const imageData = editor.ctx.getImageData(0, 0, editor.canvas.width, editor.canvas.height);
    const mask = aiProcessor.detectTextRegions(imageData.data, imageData.width, imageData.height);
    
    // 創建預覽畫布
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = imageData.width;
    previewCanvas.height = imageData.height;
    const previewCtx = previewCanvas.getContext('2d');
    
    // 繪製原圖
    previewCtx.putImageData(imageData, 0, 0);
    
    // 高亮檢測到的文字區域
    const highlightData = previewCtx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
            const pixelIndex = i * 4;
            // 添加藍色高亮
            highlightData.data[pixelIndex] = Math.max(0, highlightData.data[pixelIndex] - 50);
            highlightData.data[pixelIndex + 1] = Math.max(0, highlightData.data[pixelIndex + 1] - 50);
            highlightData.data[pixelIndex + 2] = Math.min(255, highlightData.data[pixelIndex + 2] + 100);
            highlightData.data[pixelIndex + 3] = 200; // 半透明
        }
    }
    previewCtx.putImageData(highlightData, 0, 0);
    
    // 顯示預覽對話框
    showTextDialog(previewCanvas.toDataURL());
}

function showTextDialog(previewDataUrl) {
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #2c2c2c;
        padding: 25px;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        color: white;
        border: 1px solid #444;
    `;
    
    content.innerHTML = `
        <h3 style="margin-bottom: 15px;">📝 文字檢測預覽</h3>
        <p style="margin-bottom: 15px; color: #ccc;">藍色區域為檢測到的可能文字位置</p>
        <div style="margin-bottom: 20px; max-height: 400px; overflow: auto;">
            <img src="${previewDataUrl}" style="max-width: 100%; border: 1px solid #555; border-radius: 5px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 14px;">
                <input type="checkbox" id="skipTextPreview" style="margin-right: 8px;">
                下次直接移除，不顯示預覽
            </label>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="confirmTextRemoval()" style="padding: 12px 24px; background: #e67e22; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">✅ 智能移除</button>
            <button onclick="simpleTextRemoval()" style="padding: 12px 24px; background: #f39c12; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">⚡ 快速移除</button>
            <button onclick="closeTextDialog()" style="padding: 12px 24px; background: #95a5a6; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">❌ 取消</button>
        </div>
        <div style="margin-top: 15px; font-size: 12px; color: #888; line-height: 1.4;">
            <p><strong>智能移除</strong>：使用 AI 算法精確檢測和修復文字</p>
            <p><strong>快速移除</strong>：簡單快速，適合簡單文字</p>
        </div>
    `;
    
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    
    // 存儲對話框引用
    window.currentTextDialog = dialog;
}

function confirmTextRemoval() {
    // 檢查是否要跳過預覽
    const skipPreview = document.getElementById('skipTextPreview')?.checked;
    if (skipPreview) {
        localStorage.setItem('skipTextPreview', 'true');
    }
    
    closeTextDialog();
    aiProcessor.removeText();
}

function simpleTextRemoval() {
    closeTextDialog();
    aiProcessor.simpleTextRemoval();
}

function closeTextDialog() {
    if (window.currentTextDialog) {
        document.body.removeChild(window.currentTextDialog);
        window.currentTextDialog = null;
    }
}

function applyAIStyle(style) {
    aiProcessor.applyStyleTransfer(style);
}

function enhanceImage() {
    aiProcessor.enhanceImage();
}

function removeBackground() {
    aiProcessor.removeBackground();
}

function cancelAIProcess() {
    aiProcessor.hideAIModal();
    aiProcessor.isProcessing = false;
    document.getElementById('statusText').textContent = 'AI 處理已取消';
}