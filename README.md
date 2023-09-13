# [Degrees of Lewdity][dol] 模组编写小助手

## 简介
由于原游戏引擎面向字符串编程的特性，以及变量文本硬编码的困难，编写模组十分困难，因此简单十分钟手搓一个帮助编写模组的小脚本。

## 食用方法
注意：由于 `main.py` 中的 `mod.cover_source_files()` 方法会覆盖游戏源文件，因此推荐注释掉此行，自行备份好源文件后手动覆盖游戏源文件。

1. 需要 Python 3.10+
2. 在根目录使用 `pip install -r requirements.txt` 安装依赖库
3. 需要 `https://gitgud.io/Vrelnir/degrees-of-lewdity` 游戏源码，请自行下载，默认将 `degrees-of-lewdity-master` 放在根目录下
4. 修改 `main.py` 中的作者名，需要与 `<根目录>/mods/<作者名>` 中一致
5. 运行 `main.py` (`python -m main`)

## 编写自己模组的注意事项
1. 请在 `<根目录>/mods/<作者名>` 文件夹下编写你的模组
2. 本项目文件夹结构应该类似于：
```text
<根目录>
├── data
├── degrees-of-lewdity-master
├── mods
│   └── Number_Sir
│      ├── img
│      │   └── <这里放图片，参照原游戏目录>
│      ├── game
│      │   └── <这里放 twee 和 js 代码，参照原游戏目录>
│      └── modules
│          └── css
│              └── <这里面放 css 文件，参照原游戏目录>
├── results
└── src
```
注意 `img`, `game`, `css` 三个文件夹并不是都必需的，比如你只想做类似美化的模组，就可以只有 `img` 文件夹，等等。

请遵循以下格式：
   1. 对于完全新建、自创的内容，请注意不要和原游戏内容重名，比如：
      * 图片命名、路径不要和原游戏内容重复
      * `.twee`, `.js`, `.css` 文件命名不要和原游戏内容重复
      * `.twee` 文件中的段落(形如 `:: PASSAGE_NAME [WIDGET]`)的段落名不要和原游戏有的重复

   2. 对于想覆盖原游戏的已有的内容：
      * 图片命名、路径请和原游戏文件夹中的完全一致
      * `.twee` 中的段落，请把原游戏中的整段内容(从 `:: PASSAGE_NAME` 开始到下一个 `:: PASSAGE_NAME` 的上一行结束)全部复制出来到你的文件中，然后进行改动
      * `.js`, `.css` 命名、路径请和原游戏文件夹中的完全一致


[dol]: https://gitgud.io/Vrelnir/degrees-of-lewdity