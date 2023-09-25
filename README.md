# [Degrees of Lewdity][dol] 模组编写小助手

---
| [简体中文](README.md) | [English](data/docs/README-en.md) |

![maven](https://img.shields.io/badge/python-3.10%2B-blue)

---
## 目录
* [简介](#简介)
* [食用方法](#食用方法)
  * [使用步骤](#使用步骤)
  * [工作流程](#本脚本的工作流程)
* [注意事项](#编写自己模组的注意事项)
  * [名词解释](#名词解释)
  * [详细说明](#详细说明)
  * [boot.json](#关于-bootjson-文件)
  * [模组文件](#关于模组文件)
  * [举例说明](#举例说明)
---

## 简介
由于[原游戏引擎](https://twinery.org/)面向字符串编程的特性，以及变量文本硬编码的困难，编写模组十分困难，因此简单十分钟手搓一个帮助编写模组的小脚本。
本脚本可以与 [ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader) 配合使用，使用本脚本需要一些微量的 Python 知识。

## 食用方法

### 使用步骤
1. 需要 [Python 3.10+](https://www.python.org/downloads/release/python-31011/)
2. 在根目录打开命令提示符输入 `pip install -r requirements.txt` 安装依赖库。
3. 在 `<根目录>/mods/<模组名或作者名>` 里编写你自己的模组。(初次运行请手动创建 `mods` 文件夹)。
4. 运行 `main.py` (在命令提示符中输入 `python -m main`)。
5. 结果会以 zip 压缩包形式生成在 `results` 文件夹中，接下来请使用 [https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader) 进行模组加载
6. 如果将 `main.py` 文件中的 `auto_apply=False` 改为 `auto_apply=True` 后运行，如此运行结果将会用模组文件自动覆盖游戏源码，方便测试使用

### 本脚本的工作流程
1. 每次运行前会自动删除 `degrees-of-lewdity-master`, `results` 文件夹，__请不要向其中放置重要文件__
2. 从源码仓库下载游戏源码并解压到根目录
3. 根据模组内容自动编写 `boot.json` 文件
4. 将模组内容处理并打包为 zip 文件，可以通过 [https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader) 加载
5. 如果 `main.py` 文件中的 `auto_apply=True`，则每次运行完将会自动用模组文件自动覆盖游戏源码

## 编写自己模组的注意事项
### 名词解释

- __“段落”__
  - 这是游戏内容的基本单位。
  - 在 `.twee` 文件中形如 `:: PASSAGE_NAME` 或 `:: PASSAGE_NAME [widget]` 的内容为段落的开头，从此开始一直到下一个段落开头均为此段落的内容。

- __“根目录”__
  - `main.py` 所在的目录

### 详细说明
1. 请在 `<根目录>/mods/<模组名或作者名>` 文件夹下编写你的模组，或者将你正在编写的模组文件夹按照下方结构放进 `<根目录>/mods` 文件夹中
2. 请尽量在英文源码的基础上编写模组，因为汉化版仍在润色以及修复可能存在的问题，因此如果基于汉化版原版制作模组可能出现今天做的模组明天就和游戏内容对不上的问题。基于英文源码制作模组，覆盖原文件后仍然可以覆写汉化。
   * 注：基于英文源码制作模组指的是当出现改动源码内容时请复制英文版源码的内容后改动，而不是说要用英文写模组。
3. 本项目文件夹结构应该类似于：
```text
<根目录>
 ├── data
 │   ├── docs (说明文档，未完成)
 │   ├── langs (程序日志输出的语言)
 │   │   ├── en_us.json (默认语言)
 │   │   └── zh_cn.json (简体中文)
 │   ...
 ├── degrees-of-lewdity-master (游戏源码)
 ├── mods
 │   └── Number_Sir (你的模组名称或作者昵称)
 │       ├── boot.json <这个文件是必需的>
 │       ├── img (参照源码目录结构放置图片等文件)
 │       ├── game (参照源码目录结构放置 .twee 等文件)
 │       ├── modules 
 │       │   └── css (参照源码目录结构放置 .css 等文件)
 │      ... 
 ├── results (处理结果，包括压缩包和文件夹)
 ├── src (代码部分)
 ├── LICENSE
 ├── main.py (程序入口)
 ├── README.md
 ├── requirements.txt (依赖库)
 ...
```
注意 `img`, `game`, `css` 三个文件夹并不是都必需的，比如你只想做类似美化的模组，就可以只有 `img` 文件夹，等等。

---
### 关于 boot.json 文件
请在 `boot.json` 文件中填写以下信息：
```json
{
  "name": "这个模组的名称",
  "version": "这个模组的版本",
  "ignoreList": [
    "要忽略的目录路径",
    "要忽略的文件路径",
    "注意未填入 ignore 的除 twee, js, css 与图片文件外的文件将全部打入压缩包中。"
  ],
  "additionFile": [
    "要加进压缩包的文件路径",
    "注意当 additionFile 与 ignoreList 同时存在时，会以 additionFile 为准"
  ],
  "scriptFileList_inject_early": [
    "提前注入的 js 脚本路径, 会在当前模组加载后立即插入到 dom 中由浏览器按照 <script> 的标注执行方式执行",
    "可以为空列表。"
  ],
  "scriptFileList_earlyload": [
    "提前加载的 js 脚本, 会在当前模组加载后, inject_early 脚本全部插入完成后，由 ModLoader 执行并等待异步指令返回，可以在这里读取到未修改的段落内容",
    "可以为空列表。"
  ],
  "scriptFileList_preload": [
    "预加载的 js 脚本, 会在引擎初始化前、模组的数据文件全部加载并合并到 html 的 tw-storydata 中后, 由 ModLoader 执行并等待异步指令返回, 可以在此处调用 ModLoader 的 API 读取最新的段落数据并动态修改覆盖段落内容",
    "注意 scriptFileList_preload 文件有固定的格式, 详见 ModLoader 库",
    "可以为空列表。"
  ],
  "addonPlugin": [
    "依赖的插件列表，在此声明本mod依赖哪些插件，在此处声明后会调用对应的插件，不满足的依赖会在加载日志中产生警告",
    "具体格式请参照 ModLoader 库",
    "可以为空列表。"
  ],
  "dependenceInfo": [
    "依赖的mod列表，可以在此声明此mod依赖哪些前置mod，不满足的依赖会在加载日志中产生警告",
    "具体格式请参照 ModLoader 库",
    "可以为空列表。"
  ]
}
```
比如一个最简单的 `boot.json` 文件应该形如:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0"
}
```

如果这个文件 `game/only-for-test.twee` 你不想丢进压缩包，可以这样写:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0",
  "ignoreList": [
    "game/only-for-test.twee"
  ]
}
```
---
### 关于模组文件
请遵循以下格式：
   1. 对于完全新建、自创的内容，比如：`新建一个段落`, `新建一个.twee文件`、`新建一张衣服的图片文件`等，请注意不要和原游戏内容重名。
   2. 对于想覆盖原游戏的已有的内容，比如：`把原有的衣服图片文件重新绘制`、`对已有的段落内容中新加代码`等：
      * 图片命名、路径请和原游戏文件夹中的完全一致
      * `.twee` 中的段落，请把原游戏中有修改、增加、删除的整个段落(从 `:: PASSAGE_NAME` 开始到下一个 `:: PASSAGE_NAME` 的上一行结束)全部复制出来到你的文件中，然后进行改动
      * __不推荐图片、js、css 文件覆盖原游戏内容，请尽量创建新的图片、js、css 文件。__
   3. 注意你写在自己模组内容中的所有段落都应该是相比于源代码中有所改动的，如果你复制了一个段落出来但没有做改动，记得把它删掉。

### 举例说明
1. 如果你想修改源码中已经有的 `game/overworld-town/loc-school/canteen.twee` 文件中的 `:: Canteen` 段落：
   1. 请先创建新文件：`/mods/<你的模组名称>/game/overworld-town/loc-school/canteen.twee`
   2. 然后将源码中的 `:: Canteen` 这一行开始一直到 `:: Canteen Lunch` 的上一行复制到模组文件中
   3. 然后进行修改。
2. 如果你想新建一个完全不存在的段落比如 `:: Example Mod Test Passage`：
   1. 请先创建新文件：`/mods/<你的模组名称>/game/example mod test.twee`
   2. 然后在其中创作你的新段落

[dol]: https://gitgud.io/Vrelnir/degrees-of-lewdity