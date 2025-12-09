"""測試 GUI 是否能正常啟動"""
import sys

print("=== 測試 GUI 依賴 ===\n")

# 測試 tkinter
try:
    import tkinter as tk
    print("✓ tkinter 可用")
    
    # 測試創建窗口
    root = tk.Tk()
    root.title("測試窗口")
    root.geometry("300x200")
    
    label = tk.Label(root, text="如果你看到這個窗口，\ntkinter 工作正常！", font=('Arial', 12))
    label.pack(expand=True)
    
    close_btn = tk.Button(root, text="關閉", command=root.destroy)
    close_btn.pack(pady=10)
    
    print("✓ 測試窗口已創建")
    print("\n請檢查是否有窗口彈出...")
    print("如果沒有看到窗口，可能是顯示問題")
    
    root.mainloop()
    
except ImportError as e:
    print(f"✗ tkinter 不可用: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ 創建窗口時出錯: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✓ GUI 測試完成")
