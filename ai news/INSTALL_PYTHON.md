# Python 安裝指南（Windows）

## 方法一：從 Python 官網安裝（推薦）

### 步驟 1：下載 Python

1. 訪問 Python 官方網站：https://www.python.org/downloads/
2. 點擊 "Download Python 3.12.x"（最新穩定版）
3. 下載完成後，運行安裝程序

### 步驟 2：安裝 Python

**重要：安裝時必須勾選以下選項！**

1. ✅ **勾選 "Add Python to PATH"**（這是最重要的步驟）
2. 點擊 "Install Now" 或 "Customize installation"
3. 如果選擇自定義安裝，建議勾選：
   - ✅ pip
   - ✅ tcl/tk and IDLE
   - ✅ Python test suite
   - ✅ py launcher
   - ✅ for all users (optional)

### 步驟 3：驗證安裝

安裝完成後，打開新的命令提示字元或 PowerShell，運行：

```bash
python --version
```

應該顯示類似：`Python 3.12.0`

```bash
pip --version
```

應該顯示 pip 的版本信息

---

## 方法二：使用 Microsoft Store 安裝

1. 打開 Microsoft Store
2. 搜索 "Python 3.12" 或 "Python 3.11"
3. 點擊 "取得" 或 "安裝"
4. 安裝完成後會自動添加到 PATH

---

## 方法三：使用 Chocolatey（進階用戶）

如果你已經安裝了 Chocolatey 包管理器：

```bash
choco install python
```

---

## 安裝完成後的步驟

### 1. 驗證 Python 安裝

打開新的 PowerShell 或命令提示字元：

```bash
python --version
pip --version
```

### 2. 安裝項目依賴

在項目目錄下運行：

```bash
pip install -r requirements.txt
```

這會安裝：
- requests（HTTP 請求）
- beautifulsoup4（HTML 解析）
- schedule（定時任務）

### 3. 運行測試

```bash
python test_scraper.py
```

### 4. 運行主程序

```bash
python news_scraper.py
```

---

## 常見問題

### Q1: 安裝後仍然找不到 python 命令

**解決方法：**
1. 重新啟動電腦
2. 或者手動添加 Python 到 PATH：
   - 右鍵點擊 "本機" → "內容"
   - 點擊 "進階系統設定"
   - 點擊 "環境變數"
   - 在 "系統變數" 中找到 "Path"
   - 添加 Python 安裝路徑（通常是 `C:\Python312` 或 `C:\Users\你的用戶名\AppData\Local\Programs\Python\Python312`）

### Q2: pip 安裝模塊時出現權限錯誤

**解決方法：**
```bash
pip install --user -r requirements.txt
```

### Q3: 出現 SSL 證書錯誤

**解決方法：**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

## 快速檢查清單

- [ ] Python 已安裝（`python --version` 有輸出）
- [ ] pip 已安裝（`pip --version` 有輸出）
- [ ] 依賴包已安裝（`pip install -r requirements.txt`）
- [ ] 測試程序可以運行（`python test_scraper.py`）
- [ ] 主程序可以運行（`python news_scraper.py`）

---

## 需要幫助？

如果遇到問題，請提供以下信息：
1. Windows 版本
2. 錯誤訊息的完整內容
3. 運行 `python --version` 的輸出
4. 運行 `pip --version` 的輸出
