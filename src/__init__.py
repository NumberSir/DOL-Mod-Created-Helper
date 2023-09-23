"""
1. 下载游戏源码到本地
2. 下载要的模组到本地
3. 获取游戏已有的所有段落 (形如 :: PASSAGE_NAME [WIDGET])

4.      检查一下模组文件夹内容
4.1.    根目录的 img, game, modules/css 文件夹
4.2.    js 语法，css 语法之类
4.3.    段落名
4.3.1.  新 twee 文件中有没有重复段落
4.3.2.  重名 twee 文件中有没有多余段落

5.      获取并处理模组的所有段落
5.1.    重复的替换原文
5.2.    新建的复制粘贴

6.      处理其他文件
"""
from .consts import *
from .langs import *
from .log import *

from .download_utils import *
from .core import *
