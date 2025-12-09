"""
測試新聞爬蟲功能
"""
from news_scraper import fetch_news

def test_news_scraper():
    print("=" * 60)
    print("測試新聞爬蟲功能")
    print("=" * 60)
    
    topic = "科技"
    print(f"\n搜索主題: {topic}")
    print("-" * 60)
    
    news_data = fetch_news(topic, max_articles=5)
    
    if news_data:
        print(f"\n✅ 成功找到 {len(news_data)} 條新聞\n")
        
        for idx, news in enumerate(news_data, 1):
            print(f"{idx}. {news['title']}")
            print(f"   來源: {news['source']}")
            print(f"   摘要: {news['snippet'][:80]}...")
            print(f"   鏈接: {news['link'][:60]}...")
            print(f"   時間: {news['scraped_at']}")
            if news['image']:
                print(f"   圖片: 有")
            print()
    else:
        print("\n❌ 未找到新聞")
    
    print("=" * 60)
    print("測試完成！")
    print("=" * 60)

if __name__ == "__main__":
    test_news_scraper()
