from PIL import Image
import os

def split_icons(image_path, output_dir=None, cols=5, rows=3, padding=10):
    """
    将包含多个图标的图片切割成单个图标
    
    Args:
        image_path: 输入图片路径
        output_dir: 输出目录，默认在图片同目录下创建"split_icons"文件夹
        cols: 列数（图标排列的列数）
        rows: 行数（图标排列的行数）
        padding: 图标周围的内边距（像素）
    """
    # 打开图片
    img = Image.open(image_path)
    img_width, img_height = img.size
    
    # 计算每个图标的尺寸
    icon_width = img_width // cols
    icon_height = img_height // rows
    
    # 创建输出目录
    if output_dir is None:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_dir = os.path.join(os.path.dirname(image_path), f"{base_name}_split")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 切割并保存每个图标
    icon_count = 0
    for row in range(rows):
        for col in range(cols):
            # 计算图标区域
            left = col * icon_width
            upper = row * icon_height
            right = left + icon_width
            lower = upper + icon_height
            
            # 裁剪图标
            icon = img.crop((left, upper, right, lower))
            
            # 保存图标
            icon_count += 1
            icon_name = f"icon_{row+1}_{col+1}.png"
            icon_path = os.path.join(output_dir, icon_name)
            icon.save(icon_path)
            print(f"已保存: {icon_path}")
    
    print(f"\n完成！共切割了 {icon_count} 个图标")
    print(f"输出目录: {output_dir}")

def split_all_icons():
    """切割所有包含多个图标的PNG文件"""
    # 定义要切割的文件和它们的网格配置
    files_to_split = [
        ("功能图标.png", 5, 3),
        ("场景分类图标.png", 5, 3),
        ("做法分类图标.png", 5, 3),
        ("菜系分类图标.png", 5, 3),
    ]
    
    for filename, cols, rows in files_to_split:
        file_path = os.path.join(os.path.dirname(__file__), filename)
        if os.path.exists(file_path):
            print(f"\n处理文件: {filename}")
            print(f"网格配置: {cols}列 x {rows}行")
            split_icons(file_path, cols=cols, rows=rows)
        else:
            print(f"文件不存在: {filename}")

if __name__ == "__main__":
    # 切割所有图标文件
    split_all_icons()