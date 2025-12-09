"""
測試緊湊版 GUI
"""
import tkinter as tk
from news_gui import NewsApp

if __name__ == "__main__":
    print("啟動緊湊版新聞 GUI...")
    root = tk.Tk()
    app = NewsApp(root)
    print("GUI 已啟動！")
    root.mainloop()
