# ZQQ&LWW的云厨房 - 数据需求文档

## 菜谱数据格式

```json
{
  "name": "番茄炒蛋",
  "cover_desc": "一道经典的家常菜，番茄的酸甜搭配鸡蛋的嫩滑，简单又下饭",
  "category": {
    "cuisine": "家常菜",
    "taste": "咸鲜",
    "main_ingredient": "番茄",
    "method": "炒",
    "scene": "晚餐"
  },
  "difficulty": 1,
  "duration": 15,
  "servings": 2,
  "ingredients": [
    { "name": "番茄", "amount": "2", "unit": "个" },
    { "name": "鸡蛋", "amount": "3", "unit": "个" },
    { "name": "食用油", "amount": "2", "unit": "勺" },
    { "name": "盐", "amount": "1", "unit": "小勺" },
    { "name": "糖", "amount": "0.5", "unit": "小勺" },
    { "name": "葱花", "amount": "适量", "unit": "" }
  ],
  "tools": ["炒锅", "铲子", "碗", "筷子"],
  "steps": [
    { "step": 1, "desc": "番茄洗净，切成小块备用" },
    { "step": 2, "desc": "鸡蛋打入碗中，加少许盐搅打均匀" },
    { "step": 3, "desc": "锅中倒油烧热，倒入蛋液炒至凝固，盛出备用" },
    { "step": 4, "desc": "锅中再加少许油，放入番茄块翻炒出汁" },
    { "step": 5, "desc": "加入糖和盐调味，倒入炒好的鸡蛋翻炒均匀" },
    { "step": 6, "desc": "撒上葱花即可出锅" }
  ],
  "nutrition_per_serving": {
    "calories": 180,
    "protein": 12,
    "fat": 10,
    "carbs": 8,
    "fiber": 2
  },
  "tags": ["快手菜", "下饭", "新手友好"],
  "tips": "番茄可以提前用开水烫一下去皮，口感更好"
}
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 菜名 |
| cover_desc | string | ✅ | 菜品简介（1-2句话） |
| category.cuisine | string | ✅ | 菜系：家常菜/川菜/粤菜/湘菜/鲁菜/苏菜/浙菜/闽菜/徽菜/西餐/日韩料理/东南亚菜/其他 |
| category.taste | string | ✅ | 口味：咸鲜/麻辣/酸辣/甜/酸甜/清淡/香辣/酱香/蒜香/咖喱/其他 |
| category.main_ingredient | string | ✅ | 主要食材：番茄/鸡肉/猪肉/牛肉/鱼/虾/豆腐/鸡蛋/土豆/茄子/其他 |
| category.method | string | ✅ | 做法：炒/炖/煮/蒸/烤/炸/煎/拌/腌/煲/焖/其他 |
| category.scene | string | ✅ | 场景：早餐/午餐/晚餐/夜宵/便当/下午茶/宴客/节日/其他 |
| difficulty | number | ✅ | 难度：1-5（1最简单） |
| duration | number | ✅ | 耗时（分钟） |
| servings | number | ✅ | 份量（几人份） |
| ingredients | array | ✅ | 食材列表 |
| ingredients[].name | string | ✅ | 食材名称 |
| ingredients[].amount | string | ✅ | 用量（数字或"适量"） |
| ingredients[].unit | string | ✅ | 单位：个/克/勺/小勺/片/根/块/颗/适量时留空/其他 |
| tools | array | ✅ | 工具列表 |
| steps | array | ✅ | 步骤列表 |
| steps[].step | number | ✅ | 步骤序号 |
| steps[].desc | string | ✅ | 步骤描述 |
| nutrition_per_serving | object | ✅ | 每份营养成分 |
| nutrition_per_serving.calories | number | ✅ | 热量（千卡） |
| nutrition_per_serving.protein | number | ✅ | 蛋白质（克） |
| nutrition_per_serving.fat | number | ✅ | 脂肪（克） |
| nutrition_per_serving.carbs | number | ✅ | 碳水化合物（克） |
| nutrition_per_serving.fiber | number | ❌ | 膳食纤维（克） |
| tags | array | ❌ | 标签：快手菜/下饭/新手友好/硬菜/减脂/增肌/暖胃/清淡/其他 |
| tips | string | ❌ | 小贴士/注意事项 |

## 图片要求

| 图片类型 | 数量 | 尺寸 | 说明 |
|----------|------|------|------|
| 菜品成品图 | 100张 | 750x750px | 每道菜1张 |
| 步骤图 | 约500-600张 | 750x750px | 每个关键步骤1张 |

## GPT找数据Prompt

```
请按照以下JSON格式整理菜谱数据，共需要100道菜。

要求：
1. 数据真实准确，步骤可实际操作
2. 营养成分参考《中国食物成分表》
3. 每道菜5-7个步骤
4. 覆盖以下维度（尽量均匀分布）：
   - 菜系：家常菜、川菜、粤菜、湘菜、西餐、日韩料理
   - 口味：咸鲜、麻辣、酸辣、甜、清淡
   - 做法：炒、炖、煮、蒸、烤、炸、煎、拌
   - 场景：早餐、午餐、晚餐、夜宵、便当
   - 难度：1-5级

JSON格式：
{
  "name": "菜名",
  "cover_desc": "简介",
  "category": { "cuisine": "", "taste": "", "main_ingredient": "", "method": "", "scene": "" },
  "difficulty": 1,
  "duration": 15,
  "servings": 2,
  "ingredients": [{ "name": "", "amount": "", "unit": "" }],
  "tools": [],
  "steps": [{ "step": 1, "desc": "" }],
  "nutrition_per_serving": { "calories": 0, "protein": 0, "fat": 0, "carbs": 0, "fiber": 0 },
  "tags": [],
  "tips": ""
}

请分批次输出，每批10道菜，共10批完成。
```
