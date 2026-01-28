class PureRotationTool {
    constructor() {
        this.originalImage = null;
        this.originalFileName = '';
        this.rotatedImages = [];
        this.currentPreset = 'circle';
        this.presetAngles = {
            circle: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
            triangle: [0, 120, 240],
            square: [0, 90, 180, 270]
        };
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.presetSection = document.getElementById('presetSection');
        this.progressSection = document.getElementById('progressSection');
        this.previewSection = document.getElementById('previewSection');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.angleSlider = document.getElementById('angleSlider');
        this.angleDisplay = document.getElementById('angleDisplay');
    }

    bindEvents() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Shape preset buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', this.handlePresetClick.bind(this));
        });
        
        // Generate button
        this.generateBtn.addEventListener('click', this.generateRotations.bind(this));
        
        // Download button
        this.downloadBtn.addEventListener('click', this.downloadAll.bind(this));
        
        // Angle slider
        this.angleSlider.addEventListener('input', this.handleSliderChange.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!this.isValidImageFile(file)) {
            alert('Please select a valid image file (PNG, JPG, or WEBP)');
            return;
        }

        // Store original filename without extension
        this.originalFileName = file.name.replace(/\.[^/.]+$/, "");

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.showPresets();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    isValidImageFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        return validTypes.includes(file.type);
    }

    showPresets() {
        this.presetSection.style.display = 'block';
    }

    handlePresetClick(e) {
        document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('active'));
        e.target.closest('.shape-btn').classList.add('active');
        
        this.currentPreset = e.target.closest('.shape-btn').dataset.preset;
    }

    async generateRotations() {
        if (!this.originalImage) return;

        this.generateBtn.disabled = true;
        this.progressSection.style.display = 'block';
        this.previewSection.style.display = 'none';
        
        this.rotatedImages = [];
        const angles = this.presetAngles[this.currentPreset];
        const totalAngles = angles.length;

        for (let i = 0; i < totalAngles; i++) {
            const angle = angles[i];
            const progress = ((i + 1) / totalAngles) * 100;
            
            this.updateProgress(progress, `Generating rotation ${i + 1}/${totalAngles} (${angle}°)`);
            
            const rotatedCanvas = this.rotateImagePure(this.originalImage, angle);
            const imageBlob = await this.canvasToBlob(rotatedCanvas);
            
            this.rotatedImages.push({
                angle: angle,
                canvas: rotatedCanvas,
                blob: imageBlob
            });
            
            // Small delay to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.progressSection.style.display = 'none';
        this.generateBtn.disabled = false;
        this.showPreview();
    }

    rotateImagePure(image, angle) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Keep original dimensions - no cropping
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Move to center, rotate, then move back
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        // Draw image at original position and size
        ctx.drawImage(image, 0, 0, image.width, image.height);
        
        return canvas;
    }

    async canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png'); // Always PNG to preserve transparency
        });
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    showPreview() {
        this.previewSection.style.display = 'block';
        
        // Setup slider
        this.angleSlider.max = this.rotatedImages.length - 1;
        this.angleSlider.value = 0;
        
        // Show first rotation
        this.displayRotation(0);
    }

    handleSliderChange(e) {
        const index = parseInt(e.target.value);
        this.displayRotation(index);
    }

    displayRotation(index) {
        if (index >= 0 && index < this.rotatedImages.length) {
            const rotation = this.rotatedImages[index];
            const ctx = this.previewCanvas.getContext('2d');
            
            // Set canvas size to match rotated image
            this.previewCanvas.width = rotation.canvas.width;
            this.previewCanvas.height = rotation.canvas.height;
            
            // Clear and draw
            ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            ctx.drawImage(rotation.canvas, 0, 0);
            
            // Update angle display
            this.angleDisplay.textContent = `${rotation.angle}°`;
        }
    }

    async downloadAll() {
        if (this.rotatedImages.length === 0) return;

        const zip = new JSZip();
        const baseName = this.originalFileName || 'image';
        
        // Add each rotated image to zip
        for (const item of this.rotatedImages) {
            const filename = `${baseName}_${item.angle}deg.png`;
            zip.file(filename, item.blob);
        }
        
        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_${this.currentPreset}_rotated.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PureRotationTool();
});