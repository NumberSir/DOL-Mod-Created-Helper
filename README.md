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
  * [特殊插件和前置](#关于一些特殊的-addonplugin-或-dependences)
    * [TweeReplacer](#tweereplacer)
    * [ReplacePatch](#replacepatch)
    * [ImgLoaderHooker](#imageloaderhook)
    * [CheckDoLCompressorDictionaries](#checkdolcompressordictionaries)
  * [模组文件](#关于模组文件)
  * [举例说明](#举例说明)
---

## 简介
由于[原游戏引擎](https://twinery.org/)面向字符串编程的特性，以及变量文本硬编码的困难，编写模组十分困难，因此简单十分钟手搓一个帮助编写模组的小脚本。
使用本脚本需要微量 Python 知识。

本脚本与 [ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader) 配合使用，可以在[这里](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/)下载最新的发行版。

## 食用方法

### 使用步骤
1. 需要 [Python 3.10+](https://www.python.org/downloads/release/python-31011/)
2. 在根目录打开命令提示符输入 `pip install -r requirements.txt` 安装依赖库。
3. 在 `<根目录>/mods/<模组名或作者名>` 里编写你自己的模组。(初次运行请手动创建 `mods` 文件夹)。
4. 运行 `main.py` (在命令提示符中输入 `python -m main`)。
5. 结果会以 zip 压缩包形式生成在 `results` 文件夹中，接下来请使用 [ModLoader](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/) 进行模组加载
6. 如果将 `main.py` 中的 `REMOTE_TEST = False` 值改为 `REMOTE_TEST = True` 后运行，如此运行结果将会在每次打包完模组后自动开启本地服务器以供测试

### 本脚本的工作流程
1. 每次运行前会自动删除 `results` 文件夹，__请不要向其中放置重要文件__
2. 从源码仓库下载游戏源码并解压到根目录
3. 根据模组内容自动编写 `boot.json` 文件中的绝大多数内容
4. 将模组内容处理并打包为 zip 文件，可以通过 [ModLoader](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/) 加载
5. 如果已经下载了 ModLoader，并需要频繁测试，请将 `main.py` 中的 `REMOTE_TEST = False` 值修改为 `REMOTE_TEST = True`
   - 这样将会在每次打包完模组后自动开启本地服务器以供测试，你只需要在服务器启动后刷新浏览器即可看到改动
   - 服务器地址默认为 `http://localhost:52525`

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
 ├── modloader (模组加载器，需要手动下载)
 │   ├── mods (需要频繁测试时，会自动将打包好的模组复制到此目录)
 │   ├── Degrees of Lewdity VERSION.mod.html (加载有 ModLoader 的游戏文件) <当 `main.py` 中的 `REMOTE_TEST` 值修改为 `True` 时，本文件是必须的>
 │  ... 
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
  "additionFile": [
    "要加进压缩包的文件路径"
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
  "name": "举个例子",
  "version": "1.0.0"
}
```
如果这个文件 `README.md` 你需要放进压缩包，可以这样写:
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "additionFile": [
    "README.md"
  ]
}
```

---

### 关于一些特殊的 addonPlugin 或 dependences

#### TweeReplacer

> [仓库地址](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_TweeReplacer/)

如果你的模组中有对源码中 `.twee` 文件的改动，请加入这个插件，并填写相应的参数：
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "TweeReplacer",
      "addonName": "TweeReplacerAddon",
      "modVersion": "1.0.0",
      "params": [
        {
          "passage": "<需要替换源码中文本所在的段落名称，即 `::` 之后的纯文本，不包括方括号 `[]` 及其中内容>",
          "findString": "<在源码中用作参照的纯文本，标记需要修改的文本位置，和 findRegex 选一个即可>",
          "findRegex": "<在源码中用作参照的正则表达式，标记需要修改的文本位置，和 findString 选一个即可>",
          "replace": "<要替换为的纯文本，和 replaceFile 选一个即可>",
          "replaceFile": "<要替换为的纯文本文件路径，和 replace 选一个即可>"
        }
      ]
    }
  ],
  "dependenceInfo": [
    {
      "modName": "TweeReplacer",
      "version": "1.0.0"
    }
  ]
}
```

举例来说，如果你在 `game/04-Variables/variables-start.twee` 文件中插入了两行代码：
```text
...
:: gameStartOnly [widget]   /* 所在的段落名：gameStartOnly */
...
    ...
    <<set $fenghuangbuild to 0>>    /* 新加入的 */
    <<set $fenghuang to 0>>         /* 新加入的*/
    <<set $stray_happiness to 50>>  /* 原先就有的 */
    ...
```
那么你的 `boot.json` 应该这样写：
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "TweeReplacer",
      "addonName": "TweeReplacerAddon",
      "modVersion": "1.0.0",
      "params": [
        {
          "passage": "gameStartOnly",
          "findString": "<<set $stray_happiness to 50>>",
          "replace": "<<set $fenghuangbuild to 0>>\n\t<<set $fenghuang to 0>>\n\t<<set $stray_happiness to 50>>"
        }
      ]
    }
  ],
  "dependenceInfo": [
    {
      "modName": "TweeReplacer",
      "version": "1.0.0"
    }
  ]
}
```

---

#### ReplacePatch

> [仓库地址](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_ReplacePatch/)

如果你的模组中有对源码中 `.js` / `.css` 文件的改动，请加入这个插件，并填写相应的参数：
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "ReplacePatcher",
      "addonName": "ReplacePatcherAddon",
      "modVersion": "1.0.0",
      "params": {
        "js": [
          {
            "from": "<需要替换的源码中纯文本>",
            "to": "<要替换成的纯文本>",
            "fileName": "<某个 js 文件名>"
          }
        ],
        "css": [
          {
            "from": "<需要替换的源码中纯文本>",
            "to": "<要替换成的纯文本>",
            "fileName": "<某个 css 文件名>"
          }
        ],
        "twee": [
          {
            "passageName": "<需要替换源码中文本所在的段落名称，即 :: 之后的纯文本，不包括方括号 [] 及其中内容>",
            "from": "<需要替换的源码中纯文本>",
            "to": "<要替换成的纯文本>"
          }
        ]
      }
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ReplacePatcher",
      "version": "^1.0.0"
    }
  ]
}
```

举例来说，如果你在 `game/03-JavaScript/ingame.js` 文件中插入了一行代码：

```text
if (V.fox >= 6) modifier += 0.10;        /* 原先就有的 */
if (V.fenghuang >= 6) modifier += 0.10;  /* 新加入的 */
result = Math.floor(result * modifier);  /* 原先就有的 */
```
那么你的 `boot.json` 应该这样写：
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "ReplacePatcher",
      "addonName": "ReplacePatcherAddon",
      "modVersion": "1.0.0",
      "js": [
          {
            "fileName": "ingame.js",
            "from": "result = Math.floor(result * modifier);",
            "to": "if (V.fenghuang >= 6) modifier += 0.10;\nresult = Math.floor(result * modifier);"
          }
        ]
    }
  ],
  "dependenceInfo": [
    {
      "modName": "TweeReplacer",
      "version": "1.0.0"
    }
  ]
}
```

---

#### ImageLoaderHook

> [仓库地址](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader-ImgLoaderHooker/)

如果你的模组中有图片需要加载，请加入这个插件：
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "ModLoader DoL ImageLoaderHook",
      "addonName": "ImageLoaderAddon",
      "modVersion": "2.0.0"
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ModLoader DoL ImageLoaderHook",
      "version": "^2.0.0"
    }
  ]
}
```

---

#### CheckDoLCompressorDictionaries

> [仓库地址](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_CheckDoLCompressorDictionaries/)

这个插件仅用来检测 `DoLCompressorDictionaries` 是否被修改，因为若有修改将可能会造成存档不兼容
```json
{
  "name": "举个例子",
  "version": "1.0.0",
  "dependenceInfo": [
    {
      "modName": "CheckDoLCompressorDictionaries",
      "version": "^1.0.1"
    }
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