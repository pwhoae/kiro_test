const fileInput = document.getElementById('fileInput');
const bgType = document.getElementById('bgType');
const threshold = document.getElementById('threshold');
const thresholdValue = document.getElementById('thresholdValue');
const preview = document.getElementById('preview');
const downloadAll = document.getElementById('downloadAll');

let processedImages = [];

threshold.addEventListener('input', (e) => {
    thresholdValue.textContent = e.target.value;
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    processedImages = [];
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        processImage(file, index);
    });
});

bgType.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileInput.dispatchEvent(new Event('change'));
    }
});

threshold.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileInput.dispatchEvent(new Event('change'));
    }
});

function processImage(file, index) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            removeBackground(data);
            
            ctx.putImageData(imageData, 0, 0);
            
            const container = document.createElement('div');
            container.className = 'image-item';
            
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.onclick = () => downloadImage(canvas, file.name);
            
            container.appendChild(canvas);
            container.appendChild(downloadBtn);
            preview.appendChild(container);
            
            processedImages.push({ canvas, name: file.name });
            
            if (processedImages.length > 0) {
                downloadAll.style.display = 'block';
            }
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function removeBackground(data) {
    const bgColor = bgType.value;
    const thresh = parseInt(threshold.value);
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let shouldRemove = false;
        
        if (bgColor === 'white') {
            shouldRemove = r > 255 - thresh && g > 255 - thresh && b > 255 - thresh;
        } else if (bgColor === 'green') {
            shouldRemove = g > r + thresh && g > b + thresh;
        }
        
        if (shouldRemove) {
            data[i + 3] = 0;
        }
    }
}

function downloadImage(canvas, filename) {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\.[^/.]+$/, '') + '_nobg.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}

downloadAll.addEventListener('click', () => {
    processedImages.forEach(({ canvas, name }) => {
        downloadImage(canvas, name);
    });
});
