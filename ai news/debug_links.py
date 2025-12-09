"""調試 Google News 鏈接結構"""
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

url = "https://news.google.com/search?q=科技&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
response = requests.get(url, headers=HEADERS, timeout=10)
soup = BeautifulSoup(response.text, 'html.parser')

print("=== 分析 Google News 鏈接 ===\n")

links = soup.find_all('a', href=True)
print(f"總共找到 {len(links)} 個鏈接\n")

print("前 20 個鏈接的 href 屬性:")
for i, link in enumerate(links[:20], 1):
    href = link.get('href', '')
    text = link.get_text(strip=True)[:50]
    print(f"{i}. href: {href[:60]}")
    print(f"   text: {text}\n")
