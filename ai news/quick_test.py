"""快速測試新聞爬蟲"""
from news_scraper import fetch_news, display_news, save_to_json

print("=== 快速測試新聞爬蟲 ===\n")

# 測試抓取科技新聞
print("正在抓取科技新聞...")
news_data = fetch_news("科技", max_articles=5)

if news_data:
    print(f"\n成功抓取 {len(news_data)} 條新聞！\n")
    display_news(news_data)
    save_to_json(news_data, "科技")
else:
    print("未能抓取到新聞")
