# === 新聞爬蟲配置 ===

# Google News 配置
GOOGLE_NEWS_CONFIG = {
    "zh-TW": {
        "url": "https://news.google.com/search?q={query}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
        "name": "繁體中文（台灣）"
    },
    "zh-CN": {
        "url": "https://news.google.com/search?q={query}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
        "name": "簡體中文（中國）"
    },
    "en-US": {
        "url": "https://news.google.com/search?q={query}&hl=en-US&gl=US&ceid=US:en",
        "name": "English (US)"
    },
    "ja-JP": {
        "url": "https://news.google.com/search?q={query}&hl=ja&gl=JP&ceid=JP:ja",
        "name": "日本語"
    }
}

# 默認語言
DEFAULT_LANGUAGE = "zh-TW"

# 請求頭
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# 爬蟲配置
MAX_ARTICLES = 10  # 每個主題最多抓取的新聞數量
REQUEST_TIMEOUT = 10  # 請求超時時間（秒）

# === 郵件配置 ===
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "",  # 填入你的郵箱
    "sender_password": "",  # 填入應用專用密碼
    "recipient_email": ""  # 填入收件人郵箱
}

# === 定時任務配置 ===
SCHEDULE_TIME = "08:00"  # 每天執行時間
TOPICS = ["科技", "財經", "體育", "健康"]  # 關注的主題列表
