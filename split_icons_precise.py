from PIL import Image
import os

def split_scene_icons():
    """切分场景分类图标.png - 5个图标水平排列"""
    img = Image.open("场景分类图标.png")
    width, height = img.size
    print(f"场景分类图标.png 尺寸: {width}x{height}")
    
    # 创建输出目录
    output_dir = "场景分类图标_split"
    os.makedirs(output_dir, exist_ok=True)
    
    # 5个图标水平排列，每个图标是圆形，需要确定每个图标的中心和半径
    # 根据图片观察，图标大致均匀分布
    icon_count = 5
    icon_width = width // icon_count
    
    for i in range(icon_count):
        # 计算每个图标的区域（留一些边距）
        left = i * icon_width + 20
        upper = 50
        right = (i + 1) * icon_width - 20
        lower = height - 50
        
        # 裁剪图标
        icon = img.crop((left, upper, right, lower))
        
        # 保存图标
        icon_name = f"scene_{i+1}.png"
        icon_path = os.path.join(output_dir, icon_name)
        icon.save(icon_path)
        print(f"已保存: {icon_path}")

def split_method_icons():
    """切分做法分类图标.png - 8个图标，2行4列"""
    img = Image.open("做法分类图标.png")
    width, height = img.size
    print(f"\n做法分类图标.png 尺寸: {width}x{height}")
    
    # 创建输出目录
    output_dir = "做法分类图标_split"
    os.makedirs(output_dir, exist_ok=True)
    
    # 2行4列排列
    rows, cols = 2, 4
    icon_width = width // cols
    icon_height = height // rows
    
    for row in range(rows):
        for col in range(cols):
            # 计算每个图标的区域
            left = col * icon_width + 30
            upper = row * icon_height + 30
            right = (col + 1) * icon_width - 30
            lower = (row + 1) * icon_height - 30
            
            # 裁剪图标
            icon = img.crop((left, upper, right, lower))
            
            # 保存图标
            icon_name = f"method_{row*cols+col+1}.png"
            icon_path = os.path.join(output_dir, icon_name)
            icon.save(icon_path)
            print(f"已保存: {icon_path}")

def split_cuisine_icons():
    """切分菜系分类图标.png - 6个图标，2行3列"""
    img = Image.open("菜系分类图标.png")
    width, height = img.size
    print(f"\n菜系分类图标.png 尺寸: {width}x{height}")
    
    # 创建输出目录
    output_dir = "菜系分类图标_split"
    os.makedirs(output_dir, exist_ok=True)
    
    # 2行3列排列
    rows, cols = 2, 3
    icon_width = width // cols
    icon_height = height // rows
    
    for row in range(rows):
        for col in range(cols):
            # 计算每个图标的区域
            left = col * icon_width + 30
            upper = row * icon_height + 30
            right = (col + 1) * icon_width - 30
            lower = (row + 1) * icon_height - 30
            
            # 裁剪图标
            icon = img.crop((left, upper, right, lower))
            
            # 保存图标
            icon_name = f"cuisine_{row*cols+col+1}.png"
            icon_path = os.path.join(output_dir, icon_name)
            icon.save(icon_path)
            print(f"已保存: {icon_path}")

def split_function_icons():
    """切分功能图标.png - 15个图标，3行5列"""
    img = Image.open("功能图标.png")
    width, height = img.size
    print(f"\n功能图标.png 尺寸: {width}x{height}")
    
    # 创建输出目录
    output_dir = "功能图标_split"
    os.makedirs(output_dir, exist_ok=True)
    
    # 3行5列排列
    rows, cols = 3, 5
    icon_width = width // cols
    icon_height = height // rows
    
    for row in range(rows):
        for col in range(cols):
            # 计算每个图标的区域
            left = col * icon_width + 15
            upper = row * icon_height + 15
            right = (col + 1) * icon_width - 15
            lower = (row + 1) * icon_height - 15
            
            # 裁剪图标
            icon = img.crop((left, upper, right, lower))
            
            # 保存图标
            icon_name = f"func_{row*cols+col+1}.png"
            icon_path = os.path.join(output_dir, icon_name)
            icon.save(icon_path)
            print(f"已保存: {icon_path}")

if __name__ == "__main__":
    print("开始精确切分图标...")
    split_scene_icons()
    split_method_icons()
    split_cuisine_icons()
    split_function_icons()
    print("\n所有图标切分完成！")