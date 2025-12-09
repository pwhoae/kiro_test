"""測試網絡連接和 Google News 訪問"""
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

print("=== 測試網絡連接 ===\n")

# 測試基本網絡
print("1. 測試基本網絡連接...")
try:
    response = requests.get("https://www.google.com", timeout=5)
    print(f"   ✓ 網絡連接正常 (狀態碼: {response.status_code})\n")
except Exception as e:
    print(f"   ✗ 網絡連接失敗: {e}\n")
    exit(1)

# 測試 Google News
print("2. 測試 Google News 訪問...")
url = "https://news.google.com/search?q=科技&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
try:
    response = requests.get(url, headers=HEADERS, timeout=10)
    print(f"   ✓ Google News 可訪問 (狀態碼: {response.status_code})")
    print(f"   ✓ 返回內容長度: {len(response.text)} 字符\n")
    
    # 解析 HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 嘗試不同的選擇器
    print("3. 測試 HTML 結構...")
    
    articles = soup.find_all('article')
    print(f"   找到 <article> 標籤: {len(articles)} 個")
    
    h3_tags = soup.find_all('h3')
    print(f"   找到 <h3> 標籤: {len(h3_tags)} 個")
    
    a_tags = soup.find_all('a')
    print(f"   找到 <a> 標籤: {len(a_tags)} 個\n")
    
    if articles:
        print("4. 第一個 article 的結構:")
        print(f"   {articles[0].prettify()[:500]}...\n")
    
    if h3_tags:
        print("5. 前 3 個標題:")
        for i, h3 in enumerate(h3_tags[:3], 1):
            print(f"   {i}. {h3.get_text(strip=True)[:80]}")
    
except Exception as e:
    print(f"   ✗ 訪問失敗: {e}\n")

print("\n=== 測試完成 ===")
