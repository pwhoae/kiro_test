
const audioInput = document.getElementById('audio-input');
const dropZone = document.getElementById('drop-zone');
const bitSlider = document.getElementById('bit-slider');
const rateSlider = document.getElementById('rate-slider');
const bitVal = document.getElementById('bit-val');
const rateVal = document.getElementById('rate-val');
const previewBtn = document.getElementById('preview-btn');
const stopBtn = document.getElementById('stop-btn');
const downloadBtn = document.getElementById('download-btn');

const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');
const progressFill = document.getElementById('progress-fill');

const filenameDisplay = document.getElementById('filename-display');
const uploadPrompt = document.getElementById('upload-prompt');
const fileInfo = document.getElementById('file-info');

let audioContext;
let originalBuffer;
let processedBuffer;
let currentSource;

bitSlider.oninput = () => {
    bitVal.textContent = bitSlider.value;
};

rateSlider.oninput = () => {
    rateVal.textContent = rateSlider.value;
};

dropZone.onclick = () => audioInput.click();

audioInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
};

document.getElementById('change-file').onclick = (e) => {
    e.stopPropagation();
    audioInput.click();
};

previewBtn.onclick = () => playBuffer(processedBuffer);
stopBtn.onclick = () => stopPlayback();
downloadBtn.onclick = () => downloadWav();

async function handleFile(file) {

    uploadPrompt.classList.add('hidden');
    fileInfo.classList.remove('hidden');

    filenameDisplay.textContent = file.name;

    statusBar.classList.remove('hidden');

    statusText.textContent = "DECODING AUDIO...";
    progressFill.style.width = "20%";

    const arrayBuffer = await file.arrayBuffer();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {

        originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

        progressFill.style.width = "50%";

        await processAudio();

    } catch (err) {

        statusText.textContent = "ERROR DECODING FILE";
        console.error(err);
    }
}

async function processAudio() {

    if (!originalBuffer) return;

    statusText.textContent = "PROCESSING...";
    progressFill.style.width = "70%";

    const bits = parseInt(bitSlider.value);
    const targetRate = parseInt(rateSlider.value);

    const numChannels = originalBuffer.numberOfChannels;
    const originalRate = originalBuffer.sampleRate;
    const duration = originalBuffer.duration;

    const newLength = Math.floor(duration * targetRate);

    const offlineCtx = new OfflineAudioContext(
        numChannels,
        newLength,
        targetRate
    );

    processedBuffer = offlineCtx.createBuffer(
        numChannels,
        newLength,
        targetRate
    );

    for (let channel = 0; channel < numChannels; channel++) {

        const oldData = originalBuffer.getChannelData(channel);
        const newData = processedBuffer.getChannelData(channel);

        const step = originalRate / targetRate;
        const levels = Math.pow(2, bits);

        for (let i = 0; i < newLength; i++) {

            let sample = oldData[Math.floor(i * step)];

            sample = Math.round(((sample + 1) / 2) * (levels - 1));

            sample = (sample / (levels - 1)) * 2 - 1;

            newData[i] = sample;
        }
    }

    progressFill.style.width = "100%";
    statusText.textContent = "READY";

    previewBtn.disabled = false;
    downloadBtn.disabled = false;
}

bitSlider.onchange = () => {
    if (originalBuffer) processAudio();
};

rateSlider.onchange = () => {
    if (originalBuffer) processAudio();
};

function playBuffer(buffer) {

    stopPlayback();

    currentSource = audioContext.createBufferSource();

    currentSource.buffer = buffer;

    currentSource.connect(audioContext.destination);

    currentSource.start();

    previewBtn.textContent = "🔊 PLAYING...";
    stopBtn.disabled = false;

    currentSource.onended = () => {

        previewBtn.textContent = "▶ PLAY PREVIEW";
        stopBtn.disabled = true;
    };
}

function stopPlayback() {

    if (currentSource) {
        currentSource.stop();
        currentSource = null;
    }

    previewBtn.textContent = "▶ PLAY PREVIEW";
    stopBtn.disabled = true;
}

function downloadWav() {

    const wavData = audioBufferToWav(processedBuffer);

    const blob = new Blob([wavData], { type: 'audio/wav' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    const bits = bitSlider.value;

    const originalName =
        filenameDisplay.textContent.replace(/\.[^/.]+$/, "");

    link.href = url;

    link.download = `${bits}bit_${originalName}.wav`;

    link.click();
}

function audioBufferToWav(buffer) {

    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;

    const arrayBuffer = new ArrayBuffer(44 + dataLength);

    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {

        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);

    writeString(8, 'WAVE');

    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);

    view.setUint16(20, 1, true);

    view.setUint16(22, numChannels, true);

    view.setUint32(24, sampleRate, true);

    view.setUint32(28, sampleRate * blockAlign, true);

    view.setUint16(32, blockAlign, true);

    view.setUint16(34, bitDepth, true);

    writeString(36, 'data');

    view.setUint32(40, dataLength, true);

    let offset = 44;

    for (let i = 0; i < buffer.length; i++) {

        for (let channel = 0; channel < numChannels; channel++) {

            const sample = Math.max(
                -1,
                Math.min(1, buffer.getChannelData(channel)[i])
            );

            view.setInt16(
                offset,
                sample < 0 ? sample * 0x8000 : sample * 0x7FFF,
                true
            );

            offset += 2;
        }
    }

    return arrayBuffer;
}

dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('border-emerald-500');
};

dropZone.ondragleave = () => {
    dropZone.classList.remove('border-emerald-500');
};

dropZone.ondrop = (e) => {

    e.preventDefault();

    dropZone.classList.remove('border-emerald-500');

    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith('audio/')) {
        handleFile(file);
    }
};
