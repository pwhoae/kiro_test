import schedule
import time
from news_scraper import fetch_news, save_to_json
from email_notifier import send_email_notification

# === 配置 ===
TOPICS = ["科技", "財經", "體育"]  # 可自定義主題列表
RECIPIENT_EMAIL = "your_email@example.com"
SENDER_EMAIL = "sender_email@gmail.com"
SENDER_PASSWORD = "your_app_password"  # Gmail 應用專用密碼

def daily_news_job():
    """
    每日新聞抓取任務。
    """
    print(f"\n[Info] 開始執行每日新聞抓取任務...")
    
    for topic in TOPICS:
        print(f"[Info] 正在抓取 '{topic}' 相關新聞...")
        news_data = fetch_news(topic)
        
        if news_data:
            # 保存為 JSON
            save_to_json(news_data, topic)
            
            # 發送郵件通知（可選）
            # send_email_notification(news_data, topic, RECIPIENT_EMAIL, SENDER_EMAIL, SENDER_PASSWORD)
            
            print(f"[Info] '{topic}' 新聞抓取完成，共 {len(news_data)} 條")
        else:
            print(f"[Warning] '{topic}' 未找到相關新聞")
    
    print("[Info] 每日新聞抓取任務完成！\n")

def main():
    """
    設置定時任務，每天指定時間執行。
    """
    print("=== 每日新聞摘要定時器 ===")
    print("[Info] 定時任務已啟動，將在每天 08:00 執行新聞抓取")
    print("[Info] 按 Ctrl+C 停止程序\n")
    
    # 設置每天 08:00 執行
    schedule.every().day.at("08:00").do(daily_news_job)
    
    # 也可以立即執行一次
    # daily_news_job()
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # 每分鐘檢查一次

if __name__ == "__main__":
    main()
