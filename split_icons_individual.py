from PIL import Image
import os

def find_icon_bounding_box(img):
    """找到图标在图片中的边界框（非透明区域）"""
    # 转换为RGBA模式
    img_rgba = img.convert("RGBA")
    width, height = img_rgba.size
    
    # 获取像素数据
    pixels = img_rgba.load()
    
    # 初始化边界
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    # 扫描所有像素，找到非透明区域
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:  # 非透明像素
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    
    return min_x, min_y, max_x, max_y

def split_scene_icons_individual():
    """逐个切分场景分类图标.png - 5个图标"""
    img = Image.open("场景分类图标.png")
    width, height = img.size
    print(f"场景分类图标.png 尺寸: {width}x{height}")
    
    output_dir = "场景分类图标_individual"
    os.makedirs(output_dir, exist_ok=True)
    
    # 5个图标水平排列，根据图片观察，图标大致均匀分布
    # 每个图标占宽度的1/5
    icon_width = width // 5
    
    for i in range(5):
        print(f"\n处理场景图标 {i+1}...")
        
        # 先大致裁剪出图标区域
        left = i * icon_width
        upper = 0
        right = (i + 1) * icon_width
        lower = height
        
        # 裁剪大致区域
        rough_icon = img.crop((left, upper, right, lower))
        
        # 找到图标的实际边界
        min_x, min_y, max_x, max_y = find_icon_bounding_box(rough_icon)
        print(f"  实际边界: ({min_x}, {min_y}) - ({max_x}, {max_y})")
        
        # 计算图标尺寸
        icon_w = max_x - min_x
        icon_h = max_y - min_y
        print(f"  图标尺寸: {icon_w}x{icon_h}")
        
        # 裁剪出实际图标
        actual_icon = rough_icon.crop((min_x, min_y, max_x, max_y))
        
        # 创建一个正方形画布，将图标放在中心
        canvas_size = max(icon_w, icon_h) + 40  # 添加边距
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        
        # 计算居中位置
        paste_x = (canvas_size - icon_w) // 2
        paste_y = (canvas_size - icon_h) // 2
        
        # 粘贴图标到画布中心
        canvas.paste(actual_icon, (paste_x, paste_y))
        
        # 保存图标
        icon_name = f"scene_{i+1}.png"
        icon_path = os.path.join(output_dir, icon_name)
        canvas.save(icon_path)
        print(f"  已保存: {icon_path}")

def split_method_icons_individual():
    """逐个切分做法分类图标.png - 8个图标"""
    img = Image.open("做法分类图标.png")
    width, height = img.size
    print(f"\n做法分类图标.png 尺寸: {width}x{height}")
    
    output_dir = "做法分类图标_individual"
    os.makedirs(output_dir, exist_ok=True)
    
    # 2行4列排列
    rows, cols = 2, 4
    cell_width = width // cols
    cell_height = height // rows
    
    icon_count = 0
    for row in range(rows):
        for col in range(cols):
            icon_count += 1
            print(f"\n处理做法图标 {icon_count}...")
            
            # 计算单元格区域
            left = col * cell_width
            upper = row * cell_height
            right = (col + 1) * cell_width
            lower = (row + 1) * cell_height
            
            # 裁剪单元格
            cell = img.crop((left, upper, right, lower))
            
            # 找到图标的实际边界
            min_x, min_y, max_x, max_y = find_icon_bounding_box(cell)
            print(f"  实际边界: ({min_x}, {min_y}) - ({max_x}, {max_y})")
            
            # 计算图标尺寸
            icon_w = max_x - min_x
            icon_h = max_y - min_y
            print(f"  图标尺寸: {icon_w}x{icon_h}")
            
            # 裁剪出实际图标
            actual_icon = cell.crop((min_x, min_y, max_x, max_y))
            
            # 创建一个正方形画布，将图标放在中心
            canvas_size = max(icon_w, icon_h) + 40  # 添加边距
            canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
            
            # 计算居中位置
            paste_x = (canvas_size - icon_w) // 2
            paste_y = (canvas_size - icon_h) // 2
            
            # 粘贴图标到画布中心
            canvas.paste(actual_icon, (paste_x, paste_y))
            
            # 保存图标
            icon_name = f"method_{icon_count}.png"
            icon_path = os.path.join(output_dir, icon_name)
            canvas.save(icon_path)
            print(f"  已保存: {icon_path}")

def split_cuisine_icons_individual():
    """逐个切分菜系分类图标.png - 6个图标"""
    img = Image.open("菜系分类图标.png")
    width, height = img.size
    print(f"\n菜系分类图标.png 尺寸: {width}x{height}")
    
    output_dir = "菜系分类图标_individual"
    os.makedirs(output_dir, exist_ok=True)
    
    # 2行3列排列
    rows, cols = 2, 3
    cell_width = width // cols
    cell_height = height // rows
    
    icon_count = 0
    for row in range(rows):
        for col in range(cols):
            icon_count += 1
            print(f"\n处理菜系图标 {icon_count}...")
            
            # 计算单元格区域
            left = col * cell_width
            upper = row * cell_height
            right = (col + 1) * cell_width
            lower = (row + 1) * cell_height
            
            # 裁剪单元格
            cell = img.crop((left, upper, right, lower))
            
            # 找到图标的实际边界
            min_x, min_y, max_x, max_y = find_icon_bounding_box(cell)
            print(f"  实际边界: ({min_x}, {min_y}) - ({max_x}, {max_y})")
            
            # 计算图标尺寸
            icon_w = max_x - min_x
            icon_h = max_y - min_y
            print(f"  图标尺寸: {icon_w}x{icon_h}")
            
            # 裁剪出实际图标
            actual_icon = cell.crop((min_x, min_y, max_x, max_y))
            
            # 创建一个正方形画布，将图标放在中心
            canvas_size = max(icon_w, icon_h) + 40  # 添加边距
            canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
            
            # 计算居中位置
            paste_x = (canvas_size - icon_w) // 2
            paste_y = (canvas_size - icon_h) // 2
            
            # 粘贴图标到画布中心
            canvas.paste(actual_icon, (paste_x, paste_y))
            
            # 保存图标
            icon_name = f"cuisine_{icon_count}.png"
            icon_path = os.path.join(output_dir, icon_name)
            canvas.save(icon_path)
            print(f"  已保存: {icon_path}")

def split_function_icons_individual():
    """逐个切分功能图标.png - 15个图标"""
    img = Image.open("功能图标.png")
    width, height = img.size
    print(f"\n功能图标.png 尺寸: {width}x{height}")
    
    output_dir = "功能图标_individual"
    os.makedirs(output_dir, exist_ok=True)
    
    # 3行5列排列
    rows, cols = 3, 5
    cell_width = width // cols
    cell_height = height // rows
    
    icon_count = 0
    for row in range(rows):
        for col in range(cols):
            icon_count += 1
            print(f"\n处理功能图标 {icon_count}...")
            
            # 计算单元格区域
            left = col * cell_width
            upper = row * cell_height
            right = (col + 1) * cell_width
            lower = (row + 1) * cell_height
            
            # 裁剪单元格
            cell = img.crop((left, upper, right, lower))
            
            # 找到图标的实际边界
            min_x, min_y, max_x, max_y = find_icon_bounding_box(cell)
            print(f"  实际边界: ({min_x}, {min_y}) - ({max_x}, {max_y})")
            
            # 计算图标尺寸
            icon_w = max_x - min_x
            icon_h = max_y - min_y
            print(f"  图标尺寸: {icon_w}x{icon_h}")
            
            # 裁剪出实际图标
            actual_icon = cell.crop((min_x, min_y, max_x, max_y))
            
            # 创建一个正方形画布，将图标放在中心
            canvas_size = max(icon_w, icon_h) + 40  # 添加边距
            canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
            
            # 计算居中位置
            paste_x = (canvas_size - icon_w) // 2
            paste_y = (canvas_size - icon_h) // 2
            
            # 粘贴图标到画布中心
            canvas.paste(actual_icon, (paste_x, paste_y))
            
            # 保存图标
            icon_name = f"func_{icon_count}.png"
            icon_path = os.path.join(output_dir, icon_name)
            canvas.save(icon_path)
            print(f"  已保存: {icon_path}")

if __name__ == "__main__":
    print("开始逐个切分图标...")
    split_scene_icons_individual()
    split_method_icons_individual()
    split_cuisine_icons_individual()
    split_function_icons_individual()
    print("\n所有图标切分完成！")