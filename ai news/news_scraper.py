import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

# === 配置 ===
GOOGLE_NEWS_URL = "https://news.google.com/search?q={query}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def fetch_news(topic, max_articles=10):
    """
    從 Google News 搜索指定主題的新聞
    :param topic: 搜索主題 (str)
    :param max_articles: 最多抓取的新聞數量 (int)
    :return: 包含新聞標題、鏈接和摘要的列表
    """
    url = GOOGLE_NEWS_URL.format(query=topic)
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            print(f"[Error] 無法訪問 Google News: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"[Error] 請求失敗: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    news_list = []

    # Google News 使用 <article> 標籤包含新聞
    articles = soup.find_all('article')
    
    for article in articles:
        try:
            # 查找標題和鏈接
            link_tag = article.find('a', href=True)
            if not link_tag:
                continue
            
            href = link_tag.get('href', '')
            if not href.startswith('./read/') and not href.startswith('./articles/'):
                continue
            
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            
            link = "https://news.google.com" + href[1:]
            
            # 查找摘要
            snippet = "無摘要"
            snippet_tag = article.find('div', class_='IPa2ld')
            if not snippet_tag:
                snippet_tag = article.find('span', class_='xBbh9')
            if snippet_tag:
                snippet = snippet_tag.get_text(strip=True)
            
            # 查找圖片
            image = None
            img_tag = article.find('img')
            if img_tag:
                image = img_tag.get('src') or img_tag.get('data-src')
            
            # 查找來源
            source = "Google News"
            source_tag = article.find('div', {'data-n-tid': True})
            if not source_tag:
                source_tag = article.find('a', class_='wEwyrc')
            if source_tag:
                source = source_tag.get_text(strip=True)
            
            news_list.append({
                "title": title,
                "link": link,
                "snippet": snippet,
                "image": image,
                "source": source,
                "scraped_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
            if len(news_list) >= max_articles:
                break
        except Exception as e:
            print(f"[Warning] 解析新聞時出錯: {e}")
            continue
    
    # 如果沒有找到 article 標籤，使用舊方法
    if not news_list:
        links = soup.find_all('a', href=True)
        
        for link_tag in links:
            href = link_tag.get('href', '')
            if not href.startswith('./read/'):
                continue
            
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            
            link = "https://news.google.com" + href[1:]
            
            snippet = "無摘要"
            parent = link_tag.parent
            if parent:
                for sibling in parent.find_next_siblings():
                    text = sibling.get_text(strip=True)
                    if text and len(text) > 20:
                        snippet = text
                        break

            news_list.append({
                "title": title,
                "link": link,
                "snippet": snippet,
                "image": None,
                "source": "Google News",
                "scraped_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
            if len(news_list) >= max_articles:
                break

    return news_list

def save_to_json(data, topic):
    """
    將新聞數據保存為 JSON 文件
    :param data: 新聞數據列表
    :param topic: 主題名稱 (str)
    """
    filename = f"{topic}_news_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"[Info] 新聞摘要已保存到 {filename}")
    return filename

def display_news(news_data):
    """
    在終端顯示新聞摘要
    :param news_data: 新聞數據列表
    """
    print(f"\n[Info] 找到 {len(news_data)} 條新聞：\n")
    for idx, news in enumerate(news_data, start=1):
        print(f"{idx}. {news['title']}")
        print(f"   來源: {news['source']}")
        print(f"   摘要: {news['snippet'][:100]}...")
        print(f"   鏈接: {news['link']}\n")

def main():
    print("=== 每日新聞摘要生成器 ===")
    topic = input("輸入你想搜索的新聞主題（例如 '科技', '財經', '體育'）：").strip()
    
    if not topic:
        print("[Error] 主題不能為空")
        return
    
    print(f"[Info] 正在搜尋與 '{topic}' 相關的新聞...")

    news_data = fetch_news(topic)
    if not news_data:
        print("[Error] 未找到相關新聞或發生錯誤。")
        return

    display_news(news_data)
    save_to_json(news_data, topic)

if __name__ == "__main__":
    main()
