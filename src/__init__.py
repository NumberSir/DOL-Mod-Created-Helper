"""
1.      获取游戏已有的所有段落 (形如 :: PASSAGE_NAME [WIDGET])

2.      检查一下模组文件夹内容
2.1.    根目录的 img, game, modules/css 文件夹
2.2.    js 语法，css 语法之类
2.3.    段落名
2.3.1.  新 twee 文件中有没有重复段落
2.3.2.  重名 twee 文件中有没有多余段落

3.      获取并处理模组的所有段落
3.1.    重复的替换原文
3.2.    新建的复制粘贴

4.      处理其他文件
"""
from .consts import *
from .data_source import *
from .log import *
