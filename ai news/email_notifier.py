import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json

def send_email_notification(news_data, topic, recipient_email, sender_email, sender_password):
    """
    發送新聞摘要電子郵件。
    :param news_data: 新聞數據列表
    :param topic: 主題名稱
    :param recipient_email: 收件人郵箱
    :param sender_email: 發件人郵箱
    :param sender_password: 發件人郵箱密碼或應用專用密碼
    """
    subject = f"每日新聞摘要 - {topic}"
    
    # 構建郵件內容
    body = f"<h2>今日 {topic} 新聞摘要</h2>\n"
    body += f"<p>共找到 {len(news_data)} 條相關新聞：</p>\n<hr>\n"
    
    for idx, news in enumerate(news_data, start=1):
        body += f"<h3>{idx}. {news['title']}</h3>\n"
        body += f"<p><strong>摘要：</strong>{news['snippet']}</p>\n"
        body += f"<p><a href='{news['link']}'>閱讀全文</a></p>\n<hr>\n"
    
    # 創建郵件
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'html', 'utf-8'))
    
    try:
        # 使用 Gmail SMTP 服務器（可根據需要修改）
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[Info] 郵件已成功發送到 {recipient_email}")
        return True
    except Exception as e:
        print(f"[Error] 郵件發送失敗: {e}")
        return False

def send_with_attachment(json_file, topic, recipient_email, sender_email, sender_password):
    """
    發送帶有 JSON 附件的郵件。
    :param json_file: JSON 文件路徑
    :param topic: 主題名稱
    :param recipient_email: 收件人郵箱
    :param sender_email: 發件人郵箱
    :param sender_password: 發件人郵箱密碼
    """
    subject = f"每日新聞摘要 - {topic}"
    body = f"請查看附件中的 {topic} 新聞摘要。"
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    # 添加附件
    try:
        with open(json_file, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={json_file}')
            msg.attach(part)
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[Info] 帶附件的郵件已成功發送到 {recipient_email}")
        return True
    except Exception as e:
        print(f"[Error] 郵件發送失敗: {e}")
        return False
