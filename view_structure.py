import os
import sys

def print_tree(dir_path, prefix=""):
    """Folder Structure ကို Tree ပုံစံပြပေးသည့် Function"""
    if not os.path.isdir(dir_path):
        print(f"❌ ရှာမတွေ့ပါ: {dir_path}")
        return
    ignore_dirs = ['.git', 'node_modules', '__pycache__', '.venv', 'dist', 'build']
    
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return
    entries = [e for e in entries if e not in ignore_dirs and not e.startswith('.')] 
    for i, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        connector = "└── " if i == len(entries) - 1 else "├── "
        print(prefix + connector + entry)

        if os.path.isdir(path):
            extension = "    " if i == len(entries) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":

    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    
    print(f"📂 {os.path.abspath(target_dir)} ၏ Folder Structure\n")
    print(os.path.basename(os.path.abspath(target_dir)) or ".")
    print_tree(target_dir)
    
    
ဍ