"""
新聞摘要 GUI 應用程序 - 現代化版本
提供圖形界面選擇主題和顯示新聞，支持動態背景、天氣、夜間模式等
"""
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import webbrowser
from news_scraper import fetch_news, save_to_json
from datetime import datetime
import requests
from io import BytesIO
from PIL import Image, ImageTk
import json
import os
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib.font_manager as fm

class NewsApp:
    def __init__(self, root):
        self.root = root
        self.root.title("每日新聞摘要生成器")
        self.root.geometry("1400x850")
        
        # 主題配色
        self.dark_mode = False
        self.themes = {
            'light': {
                'bg': '#f5f7fa',
                'card_bg': '#ffffff',
                'text': '#2c3e50',
                'text_secondary': '#7f8c8d',
                'accent': '#3498db',
                'accent_hover': '#2980b9',
                'hot': '#e74c3c',
                'header_bg': '#ffffff',
                'border': '#e1e8ed'
            },
            'dark': {
                'bg': '#1a1a2e',
                'card_bg': '#16213e',
                'text': '#eaeaea',
                'text_secondary': '#95a5a6',
                'accent': '#0f4c75',
                'accent_hover': '#1b6ca8',
                'hot': '#e74c3c',
                'header_bg': '#0f3460',
                'border': '#2c3e50'
            }
        }
        
        self.current_news = []
        self.current_topic = ""
        self.news_images = {}
        self.sort_order = "newest"
        self.favorites = self.load_favorites()
        self.weather_data = None
        
        self.apply_theme()
        self.create_widgets()
        self.update_time()
        self.fetch_weather()
    
    def apply_theme(self):
        """應用當前主題"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        self.root.configure(bg=theme['bg'])
    
    def toggle_dark_mode(self):
        """切換夜間模式"""
        self.dark_mode = not self.dark_mode
        # 重新創建界面
        for widget in self.root.winfo_children():
            widget.destroy()
        self.apply_theme()
        self.create_widgets()
        if self.current_news:
            self.display_news(self.current_news, self.current_topic)
    
    def load_favorites(self):
        """載入收藏的新聞"""
        try:
            if os.path.exists('favorites.json'):
                with open('favorites.json', 'r', encoding='utf-8') as f:
                    return json.load(f)
        except:
            pass
        return []
    
    def save_favorites(self):
        """保存收藏的新聞"""
        try:
            with open('favorites.json', 'w', encoding='utf-8') as f:
                json.dump(self.favorites, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存收藏失敗: {e}")
    
    def get_time_period(self):
        """獲取當前時段"""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 18:
            return 'afternoon'
        elif 18 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def get_background_gradient(self):
        """根據時間獲取背景顏色（動態漸變）"""
        period = self.get_time_period()
        if self.dark_mode:
            return self.themes['dark']['header_bg']
        
        gradients = {
            'morning': '#56CCF2',  # 清晨藍
            'afternoon': '#F2994A',  # 午後橙
            'evening': '#EB5757',  # 傍晚紅
            'night': '#2F80ED'  # 夜晚藍
        }
        return gradients.get(period, '#3498db')
    
    def get_weather_icon_animated(self):
        """根據時間獲取天氣圖標"""
        period = self.get_time_period()
        icons = {
            'morning': '🌅',  # 日出
            'afternoon': '☀️',  # 太陽
            'evening': '🌇',  # 日落
            'night': '🌙'  # 月亮
        }
        return icons.get(period, '☀️')
    
    def fetch_weather(self):
        """獲取天氣信息（模擬）"""
        # 這裡使用模擬數據，實際可接入天氣API
        period = self.get_time_period()
        conditions = {
            'morning': '晴朗',
            'afternoon': '多雲',
            'evening': '晴朗',
            'night': '晴朗'
        }
        self.weather_data = {
            'temp': '24°C',
            'condition': conditions.get(period, '晴天'),
            'icon': self.get_weather_icon_animated(),
            'location': '台北市'
        }
    
    def update_time(self):
        """更新時間顯示和動態背景"""
        if hasattr(self, 'time_label'):
            now = datetime.now()
            time_str = now.strftime('%H:%M:%S')
            
            # 中文星期
            weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
            weekday = weekdays[now.weekday()]
            date_str = now.strftime(f'%Y年%m月%d日 {weekday}')
            
            self.time_label.config(text=time_str)
            self.date_label.config(text=date_str)
            
            # 每分鐘檢查是否需要更新背景（時段變化）
            if now.second == 0:
                self.update_dynamic_background()
        
        self.root.after(1000, self.update_time)
    
    def update_dynamic_background(self):
        """更新動態背景顏色"""
        if hasattr(self, 'top_frame'):
            new_bg = self.get_background_gradient()
            try:
                self.top_frame.config(bg=new_bg)
                # 更新所有子組件的背景
                for widget in self.top_frame.winfo_children():
                    self.update_widget_bg(widget, new_bg)
            except:
                pass
    
    def update_widget_bg(self, widget, bg_color):
        """遞歸更新組件背景"""
        try:
            if widget.winfo_class() in ['Frame', 'Label']:
                widget.config(bg=bg_color)
            for child in widget.winfo_children():
                self.update_widget_bg(child, bg_color)
        except:
            pass
    
    def create_widgets(self):
        theme = self.themes['dark' if self.dark_mode else 'light']
        
        # ========== 頂部區域（緊湊設計 100px）==========
        header_bg = self.get_background_gradient()
        self.top_frame = tk.Frame(self.root, bg=header_bg, height=100)
        self.top_frame.pack(fill=tk.X, pady=(0, 0))
        self.top_frame.pack_propagate(False)
        top_frame = self.top_frame
        
        # 左側：天氣圖標 + 溫度（緊湊）
        left_info = tk.Frame(top_frame, bg=header_bg)
        left_info.pack(side=tk.LEFT, padx=20, pady=15)
        
        if self.weather_data:
            weather_frame = tk.Frame(left_info, bg=header_bg)
            weather_frame.pack()
            
            weather_icon = tk.Label(
                weather_frame,
                text=self.weather_data['icon'],
                font=('Segoe UI Emoji', 28),
                bg=header_bg,
                fg='white'
            )
            weather_icon.pack(side=tk.LEFT, padx=(0, 8))
            
            weather_info = tk.Frame(weather_frame, bg=header_bg)
            weather_info.pack(side=tk.LEFT)
            
            tk.Label(
                weather_info,
                text=self.weather_data['temp'],
                font=('Microsoft YaHei UI', 18, 'bold'),
                bg=header_bg,
                fg='white'
            ).pack(anchor=tk.W)
            
            tk.Label(
                weather_info,
                text=f"📍 {self.weather_data['location']}",
                font=('Microsoft YaHei UI', 9),
                bg=header_bg,
                fg='white'
            ).pack(anchor=tk.W)
        
        # 中間：標題和搜索（緊湊）
        center_frame = tk.Frame(top_frame, bg=header_bg)
        center_frame.pack(side=tk.LEFT, expand=True, padx=15)
        
        title_label = tk.Label(
            center_frame,
            text="📰 每日新聞",
            font=('Microsoft YaHei UI', 16, 'bold'),
            bg=header_bg,
            fg='white'
        )
        title_label.pack(pady=(8, 8))
        
        # 搜索欄（更緊湊）
        search_container = tk.Frame(center_frame, bg='white', relief=tk.FLAT)
        search_container.pack()
        
        tk.Label(
            search_container,
            text="🔍",
            font=('Segoe UI Emoji', 12),
            bg='white',
            fg='#7f8c8d'
        ).pack(side=tk.LEFT, padx=(10, 3))
        
        self.search_entry = tk.Entry(
            search_container,
            font=('Microsoft YaHei UI', 10),
            width=30,
            relief=tk.FLAT,
            borderwidth=0,
            bg='white',
            fg='#2c3e50'
        )
        self.search_entry.pack(side=tk.LEFT, ipady=6)
        self.search_entry.insert(0, "搜索新聞主題...")
        self.search_entry.bind('<FocusIn>', self.on_search_focus_in)
        self.search_entry.bind('<FocusOut>', self.on_search_focus_out)
        self.search_entry.bind('<Return>', lambda e: self.search_news())
        
        search_btn = tk.Button(
            search_container,
            text="搜索",
            font=('Microsoft YaHei UI', 9, 'bold'),
            bg=theme['accent'],
            fg='white',
            activebackground=theme['accent_hover'],
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.search_news
        )
        search_btn.pack(side=tk.LEFT, ipady=5, ipadx=12, padx=(3, 8))
        
        # 右側：時間和模式切換（緊湊）
        right_info = tk.Frame(top_frame, bg=header_bg)
        right_info.pack(side=tk.RIGHT, padx=20, pady=15)
        
        time_container = tk.Frame(right_info, bg=header_bg)
        time_container.pack()
        
        self.time_label = tk.Label(
            time_container,
            text="00:00:00",
            font=('Microsoft YaHei UI', 20, 'bold'),
            bg=header_bg,
            fg='white'
        )
        self.time_label.pack(side=tk.LEFT, padx=(0, 10))
        
        # 夜間模式切換按鈕（緊湊）
        mode_btn = tk.Button(
            time_container,
            text="🌙" if not self.dark_mode else "☀️",
            font=('Segoe UI Emoji', 16),
            bg='#34495e',
            fg='white',
            activebackground='#2c3e50',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            width=2,
            command=self.toggle_dark_mode
        )
        mode_btn.pack(side=tk.LEFT, ipady=2)
        
        self.date_label = tk.Label(
            right_info,
            text="",
            font=('Microsoft YaHei UI', 8),
            bg=header_bg,
            fg='white'
        )
        self.date_label.pack()
        
        # ========== 導航欄（熱點 + 分類 + 自定義）==========
        nav_frame = tk.Frame(self.root, bg=theme['card_bg'])
        nav_frame.pack(fill=tk.X, padx=20, pady=(10, 10))
        
        # 第一行：熱點主題
        hot_row = tk.Frame(nav_frame, bg=theme['card_bg'])
        hot_row.pack(fill=tk.X, pady=(8, 5))
        
        tk.Label(
            hot_row,
            text="🔥",
            font=('Segoe UI Emoji', 12),
            bg=theme['card_bg'],
            fg=theme['hot']
        ).pack(side=tk.LEFT, padx=(10, 8))
        
        hot_topics = ["AI", "ChatGPT", "台股", "選舉", "氣候", "半導體", "電動車"]
        for topic in hot_topics:
            hot_btn = tk.Button(
                hot_row,
                text=f"#{topic}",
                font=('Microsoft YaHei UI', 9),
                bg=theme['hot'],
                fg='white',
                activebackground='#c0392b',
                activeforeground='white',
                relief=tk.FLAT,
                cursor='hand2',
                command=lambda t=topic: self.fetch_news_thread(t)
            )
            hot_btn.pack(side=tk.LEFT, padx=3, ipady=4, ipadx=10)
        
        # 第二行：新聞分類
        topics_row = tk.Frame(nav_frame, bg=theme['card_bg'])
        topics_row.pack(fill=tk.X, pady=(5, 8))
        
        tk.Label(
            topics_row,
            text="📋",
            font=('Segoe UI Emoji', 12),
            bg=theme['card_bg'],
            fg=theme['text']
        ).pack(side=tk.LEFT, padx=(10, 8))
        
        self.topics = [
            ("🔬 科技", "科技"),
            ("💰 財經", "財經"),
            ("⚽ 體育", "體育"),
            ("🎬 娛樂", "娛樂"),
            ("🏥 健康", "健康"),
            ("🌍 國際", "國際"),
            ("🏛️ 政治", "政治"),
            ("🎓 教育", "教育")
        ]
        
        for display_name, topic_value in self.topics:
            btn = tk.Button(
                topics_row,
                text=display_name,
                font=('Microsoft YaHei UI', 9),
                bg=theme['accent'],
                fg='white',
                activebackground=theme['accent_hover'],
                activeforeground='white',
                relief=tk.FLAT,
                cursor='hand2',
                command=lambda t=topic_value: self.fetch_news_thread(t)
            )
            btn.pack(side=tk.LEFT, padx=3, ipady=5, ipadx=12)
        
        # 自定義搜索（在右側）
        tk.Label(
            topics_row,
            text="|",
            font=('Microsoft YaHei UI', 11),
            bg=theme['card_bg'],
            fg=theme['text_secondary']
        ).pack(side=tk.LEFT, padx=8)
        
        self.custom_topic_entry = tk.Entry(
            topics_row,
            font=('Microsoft YaHei UI', 9),
            relief=tk.SOLID,
            borderwidth=1,
            bg=theme['bg'],
            fg=theme['text'],
            width=12
        )
        self.custom_topic_entry.pack(side=tk.LEFT, padx=3, ipady=4)
        self.custom_topic_entry.bind('<Return>', lambda e: self.fetch_custom_topic())
        
        custom_btn = tk.Button(
            topics_row,
            text="🔍",
            font=('Segoe UI Emoji', 10),
            bg='#27ae60',
            fg='white',
            activebackground='#229954',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            width=2,
            command=self.fetch_custom_topic
        )
        custom_btn.pack(side=tk.LEFT, padx=3, ipady=5)
        

        
        # 主容器
        main_container = tk.Frame(self.root, bg=theme['bg'])
        main_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 15))
        
        # 新聞顯示面板（全寬）
        right_panel = tk.Frame(main_container, bg=theme['bg'])
        right_panel.pack(fill=tk.BOTH, expand=True)
        
        # 工具欄（狀態和排序）- 更緊湊
        toolbar = tk.Frame(right_panel, bg=theme['card_bg'])
        toolbar.pack(fill=tk.X, pady=(0, 10))
        
        # 狀態欄
        self.status_label = tk.Label(
            toolbar,
            text="💡 請選擇主題或搜索開始",
            font=('Microsoft YaHei UI', 10),
            bg=theme['card_bg'],
            fg=theme['text_secondary'],
            anchor=tk.W,
            padx=15
        )
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True, pady=8)
        
        # 排序按鈕
        sort_frame = tk.Frame(toolbar, bg=theme['card_bg'])
        sort_frame.pack(side=tk.RIGHT, padx=10)
        
        tk.Label(
            sort_frame,
            text="排序",
            font=('Microsoft YaHei UI', 9),
            bg=theme['card_bg'],
            fg=theme['text_secondary']
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        self.sort_btn = tk.Button(
            sort_frame,
            text="⬇️ 最新",
            font=('Microsoft YaHei UI', 9),
            bg=theme['accent'],
            fg='white',
            activebackground=theme['accent_hover'],
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.toggle_sort
        )
        self.sort_btn.pack(side=tk.LEFT, ipady=4, ipadx=10)
        
        # 新聞顯示區域（使用 Canvas 和 Scrollbar）
        news_frame = tk.Frame(right_panel, bg=theme['bg'])
        news_frame.pack(fill=tk.BOTH, expand=True)
        
        # 創建 Canvas 和 Scrollbar
        self.canvas = tk.Canvas(news_frame, bg=theme['bg'], highlightthickness=0)
        scrollbar = ttk.Scrollbar(news_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg=theme['bg'])
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor=tk.NW)
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 鼠標滾輪綁定
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        
        # 底部按鈕（更緊湊）
        bottom_frame = tk.Frame(right_panel, bg=theme['bg'])
        bottom_frame.pack(fill=tk.X, pady=(10, 0))
        
        save_btn = tk.Button(
            bottom_frame,
            text="💾 保存",
            font=('Microsoft YaHei UI', 9),
            bg='#9b59b6',
            fg='white',
            activebackground='#8e44ad',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.save_current_news
        )
        save_btn.pack(side=tk.LEFT, padx=5, ipady=6, ipadx=15)
        
        clear_btn = tk.Button(
            bottom_frame,
            text="🗑️ 清空",
            font=('Microsoft YaHei UI', 9),
            bg='#95a5a6',
            fg='white',
            activebackground='#7f8c8d',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.clear_news
        )
        clear_btn.pack(side=tk.LEFT, padx=5, ipady=6, ipadx=15)
        
        favorites_btn = tk.Button(
            bottom_frame,
            text="⭐ 收藏",
            font=('Microsoft YaHei UI', 9),
            bg='#f39c12',
            fg='white',
            activebackground='#e67e22',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.show_favorites
        )
        favorites_btn.pack(side=tk.LEFT, padx=5, ipady=6, ipadx=15)
        
        show_all_btn = tk.Button(
            bottom_frame,
            text="📋 顯示全部",
            font=('Microsoft YaHei UI', 9),
            bg='#3498db',
            fg='white',
            activebackground='#2980b9',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=self.show_all_news
        )
        show_all_btn.pack(side=tk.LEFT, padx=5, ipady=6, ipadx=15)
    
    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
    
    def on_search_focus_in(self, event):
        """搜索框獲得焦點時清空提示文字"""
        if self.search_entry.get() == "搜索新聞主題...":
            self.search_entry.delete(0, tk.END)
            self.search_entry.config(fg='black')
    
    def on_search_focus_out(self, event):
        """搜索框失去焦點時恢復提示文字"""
        if not self.search_entry.get():
            self.search_entry.insert(0, "搜索新聞主題...")
            self.search_entry.config(fg='grey')
    
    def search_news(self):
        """從頂部搜索欄搜索新聞"""
        topic = self.search_entry.get().strip()
        if topic and topic != "搜索新聞主題...":
            self.fetch_news_thread(topic)
        else:
            messagebox.showwarning("警告", "請輸入搜索主題")
    
    def fetch_custom_topic(self):
        """從左側面板自定義主題搜索"""
        topic = self.custom_topic_entry.get().strip()
        if topic:
            self.fetch_news_thread(topic)
        else:
            messagebox.showwarning("警告", "請輸入主題")
    
    def toggle_sort(self):
        """切換排序順序"""
        if not self.current_news:
            return
        
        if self.sort_order == "newest":
            self.sort_order = "oldest"
            self.sort_btn.config(text="⬆️ 最舊")
            self.current_news.reverse()
        else:
            self.sort_order = "newest"
            self.sort_btn.config(text="⬇️ 最新")
            self.current_news.reverse()
        
        # 重新顯示新聞
        self.clear_news()
        for idx, news in enumerate(self.current_news, start=1):
            self.create_news_card(news, idx)
    
    def fetch_news_thread(self, topic):
        """在新線程中抓取新聞，避免界面凍結"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        self.status_label.config(text=f"🔄 正在抓取「{topic}」相關新聞...", fg=theme['accent'])
        self.clear_news()
        
        thread = threading.Thread(target=self.fetch_and_display, args=(topic,))
        thread.daemon = True
        thread.start()
    
    def fetch_and_display(self, topic):
        """抓取並顯示新聞"""
        try:
            news_data = fetch_news(topic, max_articles=15)
            
            if news_data:
                self.current_news = news_data
                self.current_topic = topic
                self.root.after(0, self.display_news, news_data, topic)
            else:
                self.root.after(0, self.show_error, topic)
        except Exception as e:
            error_msg = f"抓取新聞時發生錯誤: {str(e)}"
            print(f"[Error] {error_msg}")
            self.root.after(0, self.update_status_error, error_msg)
    
    def update_status_error(self, message):
        """更新狀態為錯誤信息"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        self.status_label.config(
            text=f"❌ {message}",
            fg=theme['hot']
        )
    
    def display_news(self, news_data, topic):
        """在 GUI 中顯示新聞"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        
        # 根據當前排序順序排列
        if self.sort_order == "oldest":
            news_data = list(reversed(news_data))
            self.current_news = news_data
        
        self.status_label.config(
            text=f"✅ 找到 {len(news_data)} 條「{topic}」相關新聞 | {datetime.now().strftime('%H:%M:%S')}",
            fg='#27ae60'
        )
        
        # 創建圓餅圖（在新聞列表之前）
        if hasattr(self, 'scrollable_frame'):
            self.create_pie_chart(self.scrollable_frame)
        
        # 顯示新聞卡片
        for idx, news in enumerate(news_data, start=1):
            self.create_news_card(news, idx)
    
    def toggle_favorite(self, news):
        """切換收藏狀態"""
        news_id = news['link']
        if news_id in [fav['link'] for fav in self.favorites]:
            self.favorites = [fav for fav in self.favorites if fav['link'] != news_id]
            messagebox.showinfo("取消收藏", "已從收藏中移除")
        else:
            self.favorites.append(news)
            messagebox.showinfo("已收藏", "已添加到收藏")
        self.save_favorites()
    
    def show_favorites(self):
        """顯示收藏的新聞"""
        if not self.favorites:
            messagebox.showinfo("收藏", "您還沒有收藏任何新聞")
            return
        
        self.current_news = self.favorites
        self.current_topic = "我的收藏"
        self.display_news(self.favorites, "我的收藏")
    
    def show_all_news(self):
        """顯示所有新聞（取消篩選）"""
        if not self.current_news:
            messagebox.showinfo("提示", "請先搜索新聞")
            return
        
        self.clear_news()
        self.display_news(self.current_news, self.current_topic)
    
    def share_news(self, news):
        """分享新聞（複製鏈接到剪貼板）"""
        self.root.clipboard_clear()
        self.root.clipboard_append(news['link'])
        messagebox.showinfo("分享", "新聞鏈接已複製到剪貼板！")
    
    def load_image_from_url(self, url, size=(140, 100)):
        """從 URL 載入圖片"""
        try:
            response = requests.get(url, timeout=5)
            img_data = BytesIO(response.content)
            img = Image.open(img_data)
            img = img.resize(size, Image.Resampling.LANCZOS)
            return ImageTk.PhotoImage(img)
        except:
            return None
    
    def analyze_news_categories(self, news_data):
        """分析新聞類別分佈"""
        category_count = {}
        
        # 定義關鍵詞映射到類別
        category_keywords = {
            '科技': ['科技', 'AI', '人工智能', '電腦', '手機', '軟體', '硬體', '網路', '5G', '晶片', '半導體'],
            '財經': ['財經', '股市', '經濟', '金融', '投資', '台股', '美股', '匯率', 'GDP', '通膨'],
            '體育': ['體育', '足球', '籃球', '棒球', '網球', '奧運', '世界盃', '比賽', '運動'],
            '娛樂': ['娛樂', '電影', '音樂', '明星', '演唱會', '戲劇', '綜藝', '藝人'],
            '健康': ['健康', '醫療', '疫情', '病毒', '疫苗', '醫院', '藥物', '養生'],
            '國際': ['國際', '美國', '中國', '日本', '歐洲', '戰爭', '外交', '全球'],
            '政治': ['政治', '選舉', '政府', '總統', '立法', '政策', '法律'],
            '教育': ['教育', '學校', '大學', '考試', '學生', '教師', '課程']
        }
        
        for news in news_data:
            title = news.get('title', '')
            snippet = news.get('snippet', '')
            text = title + ' ' + snippet
            
            # 檢查文本屬於哪個類別
            categorized = False
            for category, keywords in category_keywords.items():
                if any(keyword in text for keyword in keywords):
                    category_count[category] = category_count.get(category, 0) + 1
                    categorized = True
                    break
            
            # 如果沒有匹配到任何類別，歸類為「其他」
            if not categorized:
                category_count['其他'] = category_count.get('其他', 0) + 1
        
        return category_count
    
    def create_pie_chart(self, parent_frame):
        """創建圓餅圖"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        
        if not self.current_news:
            return
        
        # 分析類別
        category_count = self.analyze_news_categories(self.current_news)
        
        if not category_count:
            return
        
        # 創建圖表框架
        chart_frame = tk.Frame(parent_frame, bg=theme['card_bg'])
        chart_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 標題
        tk.Label(
            chart_frame,
            text="📊 今日新聞類型分佈",
            font=('Microsoft YaHei UI', 12, 'bold'),
            bg=theme['card_bg'],
            fg=theme['text']
        ).pack(pady=(5, 10))
        
        # 創建 matplotlib 圖表
        fig = Figure(figsize=(5, 4), dpi=80, facecolor=theme['card_bg'])
        ax = fig.add_subplot(111)
        
        # 數據準備
        categories = list(category_count.keys())
        values = list(category_count.values())
        total = sum(values)
        
        # 語義化配色
        color_map = {
            '科技': '#3498db',  # 藍色
            '財經': '#f39c12',  # 橙色
            '體育': '#2ecc71',  # 綠色
            '娛樂': '#e74c3c',  # 紅色
            '健康': '#9b59b6',  # 紫色
            '國際': '#1abc9c',  # 青色
            '政治': '#e67e22',  # 深橙
            '教育': '#27ae60',  # 深綠
            '其他': '#95a5a6'   # 灰色
        }
        
        colors = [color_map.get(cat, '#95a5a6') for cat in categories]
        
        # 繪製環形圖
        wedges, texts, autotexts = ax.pie(
            values,
            labels=categories,
            colors=colors,
            autopct=lambda pct: f'{pct:.1f}%' if pct > 5 else '',
            startangle=90,
            wedgeprops=dict(width=0.5, edgecolor='white', linewidth=2),
            textprops={'fontsize': 9, 'color': theme['text']}
        )
        
        # 設置百分比文字顏色
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(8)
        
        # 中心文字
        ax.text(0, 0, f'共 {total} 條\n新聞', 
                ha='center', va='center',
                fontsize=12, fontweight='bold',
                color=theme['text'])
        
        ax.axis('equal')
        
        # 設置背景透明
        fig.patch.set_facecolor(theme['card_bg'])
        ax.set_facecolor(theme['card_bg'])
        
        # 嵌入到 tkinter
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # 數據總結
        summary_frame = tk.Frame(chart_frame, bg=theme['card_bg'])
        summary_frame.pack(fill=tk.X, pady=(5, 10))
        
        summary_text = f"今日共發佈 {total} 條新聞，涵蓋 {len(categories)} 種分類"
        tk.Label(
            summary_frame,
            text=summary_text,
            font=('Microsoft YaHei UI', 9),
            bg=theme['card_bg'],
            fg=theme['text_secondary']
        ).pack()
        
        # 類別詳情（可點擊篩選）
        details_frame = tk.Frame(chart_frame, bg=theme['card_bg'])
        details_frame.pack(fill=tk.X, pady=(5, 0))
        
        for category, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total) * 100
            
            cat_btn = tk.Button(
                details_frame,
                text=f"{category}: {count}條 ({percentage:.1f}%)",
                font=('Microsoft YaHei UI', 8),
                bg=color_map.get(category, '#95a5a6'),
                fg='white',
                activebackground=theme['accent_hover'],
                activeforeground='white',
                relief=tk.FLAT,
                cursor='hand2',
                command=lambda c=category: self.filter_by_category(c)
            )
            cat_btn.pack(side=tk.LEFT, padx=3, pady=2, ipady=3, ipadx=8)
    
    def filter_by_category(self, category):
        """根據類別篩選新聞"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        
        # 定義關鍵詞
        category_keywords = {
            '科技': ['科技', 'AI', '人工智能', '電腦', '手機', '軟體', '硬體', '網路', '5G', '晶片', '半導體'],
            '財經': ['財經', '股市', '經濟', '金融', '投資', '台股', '美股', '匯率', 'GDP', '通膨'],
            '體育': ['體育', '足球', '籃球', '棒球', '網球', '奧運', '世界盃', '比賽', '運動'],
            '娛樂': ['娛樂', '電影', '音樂', '明星', '演唱會', '戲劇', '綜藝', '藝人'],
            '健康': ['健康', '醫療', '疫情', '病毒', '疫苗', '醫院', '藥物', '養生'],
            '國際': ['國際', '美國', '中國', '日本', '歐洲', '戰爭', '外交', '全球'],
            '政治': ['政治', '選舉', '政府', '總統', '立法', '政策', '法律'],
            '教育': ['教育', '學校', '大學', '考試', '學生', '教師', '課程']
        }
        
        keywords = category_keywords.get(category, [])
        
        # 篩選新聞
        filtered_news = []
        for news in self.current_news:
            title = news.get('title', '')
            snippet = news.get('snippet', '')
            text = title + ' ' + snippet
            
            if category == '其他':
                # 檢查是否不屬於任何類別
                is_other = True
                for cat_keywords in category_keywords.values():
                    if any(kw in text for kw in cat_keywords):
                        is_other = False
                        break
                if is_other:
                    filtered_news.append(news)
            else:
                if any(keyword in text for keyword in keywords):
                    filtered_news.append(news)
        
        # 更新顯示
        self.clear_news()
        self.status_label.config(
            text=f"📂 篩選「{category}」類別：找到 {len(filtered_news)} 條新聞",
            fg=theme['accent']
        )
        
        for idx, news in enumerate(filtered_news, start=1):
            self.create_news_card(news, idx)
    
    def create_news_card(self, news, idx):
        """創建緊湊的新聞卡片"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        
        # 卡片容器（更緊湊）
        card = tk.Frame(
            self.scrollable_frame,
            bg=theme['card_bg'],
            relief=tk.FLAT,
            highlightbackground=theme['border'],
            highlightthickness=1
        )
        card.pack(fill=tk.X, padx=10, pady=6)
        
        # 內容容器
        content_frame = tk.Frame(card, bg=theme['card_bg'])
        content_frame.pack(fill=tk.BOTH, padx=12, pady=10)
        
        # 主要內容區域（左側圖片 + 右側文字）
        main_content = tk.Frame(content_frame, bg=theme['card_bg'])
        main_content.pack(fill=tk.X, pady=(0, 8))
        
        # 左側：圖片（更小）
        if 'image' in news and news['image']:
            img_frame = tk.Frame(main_content, bg=theme['card_bg'])
            img_frame.pack(side=tk.LEFT, padx=(0, 12))
            
            photo = self.load_image_from_url(news['image'], size=(140, 100))
            if photo:
                self.news_images[f"{idx}"] = photo
                img_label = tk.Label(
                    img_frame,
                    image=photo,
                    bg=theme['card_bg']
                )
                img_label.pack()
            else:
                placeholder = tk.Label(
                    img_frame,
                    text="📰",
                    font=('Segoe UI Emoji', 32),
                    bg=theme['border'],
                    fg=theme['text_secondary'],
                    width=6,
                    height=2
                )
                placeholder.pack()
        else:
            img_frame = tk.Frame(main_content, bg=theme['card_bg'])
            img_frame.pack(side=tk.LEFT, padx=(0, 12))
            
            placeholder = tk.Label(
                img_frame,
                text="📰",
                font=('Segoe UI Emoji', 32),
                bg=theme['border'],
                fg=theme['text_secondary'],
                width=6,
                height=2
            )
            placeholder.pack()
        
        # 右側：文字內容
        text_frame = tk.Frame(main_content, bg=theme['card_bg'])
        text_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 編號 + 標題
        title_frame = tk.Frame(text_frame, bg=theme['card_bg'])
        title_frame.pack(fill=tk.X, pady=(0, 5))
        
        number_label = tk.Label(
            title_frame,
            text=str(idx),
            font=('Microsoft YaHei UI', 10, 'bold'),
            bg=theme['accent'],
            fg='white',
            width=2
        )
        number_label.pack(side=tk.LEFT, padx=(0, 8))
        
        title_label = tk.Label(
            title_frame,
            text=news['title'],
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=theme['card_bg'],
            fg=theme['text'],
            wraplength=600,
            justify=tk.LEFT,
            anchor=tk.W
        )
        title_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 摘要（更短）
        if news['snippet'] != "無摘要":
            snippet_text = news['snippet'][:120] + "..." if len(news['snippet']) > 120 else news['snippet']
            snippet_label = tk.Label(
                text_frame,
                text=snippet_text,
                font=('Microsoft YaHei UI', 9),
                bg=theme['card_bg'],
                fg=theme['text_secondary'],
                wraplength=600,
                justify=tk.LEFT,
                anchor=tk.W
            )
            snippet_label.pack(fill=tk.X, pady=(0, 5))
        
        # 來源和時間信息（更緊湊）
        info_frame = tk.Frame(text_frame, bg=theme['card_bg'])
        info_frame.pack(fill=tk.X)
        
        source = news.get('source', '未知')
        source_label = tk.Label(
            info_frame,
            text=f"📡 {source}",
            font=('Microsoft YaHei UI', 8),
            bg=theme['card_bg'],
            fg=theme['text_secondary']
        )
        source_label.pack(side=tk.LEFT, padx=(0, 10))
        
        time_label = tk.Label(
            info_frame,
            text=f"🕒 {news['scraped_at']}",
            font=('Microsoft YaHei UI', 8),
            bg=theme['card_bg'],
            fg=theme['text_secondary']
        )
        time_label.pack(side=tk.LEFT)
        
        # 底部：操作按鈕（更緊湊）
        bottom_frame = tk.Frame(content_frame, bg=theme['card_bg'])
        bottom_frame.pack(fill=tk.X)
        
        btn_frame = tk.Frame(bottom_frame, bg=theme['card_bg'])
        btn_frame.pack(side=tk.RIGHT)
        
        # 閱讀按鈕
        read_btn = tk.Button(
            btn_frame,
            text="📖 閱讀",
            font=('Microsoft YaHei UI', 9),
            bg=theme['accent'],
            fg='white',
            activebackground=theme['accent_hover'],
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            command=lambda url=news['link']: webbrowser.open(url)
        )
        read_btn.pack(side=tk.LEFT, padx=3, ipady=4, ipadx=10)
        
        # 分享按鈕
        share_btn = tk.Button(
            btn_frame,
            text="🔗",
            font=('Segoe UI Emoji', 10),
            bg='#27ae60',
            fg='white',
            activebackground='#229954',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            width=2,
            command=lambda n=news: self.share_news(n)
        )
        share_btn.pack(side=tk.LEFT, padx=3, ipady=4)
        
        # 收藏按鈕
        is_favorited = news['link'] in [fav['link'] for fav in self.favorites]
        fav_btn = tk.Button(
            btn_frame,
            text="⭐" if is_favorited else "☆",
            font=('Segoe UI Emoji', 10),
            bg='#f39c12' if is_favorited else '#95a5a6',
            fg='white',
            activebackground='#e67e22' if is_favorited else '#7f8c8d',
            activeforeground='white',
            relief=tk.FLAT,
            cursor='hand2',
            width=2,
            command=lambda n=news: self.toggle_favorite(n)
        )
        fav_btn.pack(side=tk.LEFT, padx=3, ipady=4)
    
    def show_error(self, topic):
        """顯示錯誤信息"""
        theme = self.themes['dark' if self.dark_mode else 'light']
        self.status_label.config(
            text=f"❌ 未找到「{topic}」相關新聞",
            fg=theme['hot']
        )
        messagebox.showerror("錯誤", f"未找到「{topic}」相關新聞或發生網絡錯誤")
    
    def clear_news(self):
        """清空新聞顯示"""
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
    
    def save_current_news(self):
        """保存當前新聞到 JSON"""
        if not self.current_news:
            messagebox.showwarning("警告", "沒有可保存的新聞")
            return
        
        filename = save_to_json(self.current_news, self.current_topic)
        messagebox.showinfo("成功", f"新聞已保存到：\n{filename}")

def main():
    root = tk.Tk()
    app = NewsApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
