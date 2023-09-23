# [Degrees of Lewdity][dol] Mod Created Helper

---
| [简体中文](../../README.md) | [English](README-en.md) |

![maven](https://img.shields.io/badge/python-3.10%2B-blue)

---
## Menu
* [Description](#description)
* [How to Use](#how-to-use)
  * [Steps](#steps)
  * [How does the script work](#how-does-the-script-work)
* [Notes](#notes-about-creating-your-own-mod)
  * [Definition](#definition-)
  * [Details](#details-)
  * [info.json](#about-infojson)
  * [Mod's file](#about-mods-files)
  * [Examples](#examples)
---

## Description
Due to some 'features' of [Twine](https://twinery.org/) the game engine, it is very difficult to create mods for the game. Therefore I made a rough script to help create mods more easily.
Using this script requires a little bit knowledge of Python.

This script is designed to cooperate with [ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader).

## How to Use

### Steps
1. [Python 3.10+](https://www.python.org/downloads/release/python-31011/) is required.
2. To install dependencies, run `pip install -r requirements.txt` in the Terminal / Shell.
3. Make yourt own mods in the `<ROOT>/mods/<YOUR OWN MODS' NAME>` directory. (Create `mods` folder manually.)
4. Run `main.py` (`python -m main`).
5. The results will be generated as a zip compressed package in the `results` folder, then please use [https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader) to load the mod.
6. If modify the code `auto_apply=False` to `auto_apply=True` in `main.py` then run, the result will automatically cover the source code, which will be easier to test your mod.

### How does the script work
1. In the beginning the script will delete `degrees-of-lewdity-master` and `results` folder, __DO NOT put important files in them.__
2. Then the script will download the source code of the game and extract the compressed package in the root path, by default in the `degrees-of-lewdity-master` folder.
3. The script will make `boot.json` file (for Modloader to use).
4. The script will process your mods' content and compress it to a zip file, which could be load through [https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader).
5. If modify the code `auto_apply=False` to `auto_apply=True` in `main.py`, then the script will automatically cover the source code.

## Notes about creating your own mod
### Definition 

- __"Passage"__
  - Basic unit of the game. 
  - In the `.twee` file, it appears as `:: PASSAGE_NAME` or `:: PASSAGE [widget]` which is the beginning of a "Passage", and from this line on until the beginning of the next "Passage" is the content of this "Passage".

- __"Root Path" or "Root"__
  - The directory where `main.py` is located.

### Details 
1. Please make your own mods in the `<ROOT>/mods/<YOUR OWN MODS' NAME>` directory.
2. The structure of this project should seems like:
```text
<ROOT>
 ├── data
 │   ├── docs (docs, unfinished)
 │   ├── langs (language the logs show, English by default)
 │   │   ├── en_us.json (default)
 │   │   └── zh_cn.json (Chinese Simplified)
 │   ...
 ├── degrees-of-lewdity-master (source code of the game)
 ├── mods
 │   └── Number_Sir (the name of your mods)
 │       ├── info.json <REQUIRED>
 │       ├── img (images-ish files, please refer to the source code of the game)
 │       ├── game (.twee-ish files, please refer to the source code of the game)
 │       ├── modules 
 │       │   └── css (.css-ish files, please refer to the source code of the game)
 │      ... 
 ├── results (results, including a zip file and a bunch of other files)
 ├── src 
 ├── LICENSE
 ├── main.py (entry point of the script)
 ├── README.md
 ├── requirements.txt (dependencies)
 ...
```
Note that all `img`, `game` and `css` folders are NOT REQUIRED. Such as the `beeesss` mod, only `img` folder is enough.  

---
### About info.json
Please fill in the following information in the file `info.json`：
```json
{
  "name": "The name of your mod, like 'Example Mod', REQUIRED", 
  "version": "The version of your mod, like '1.0.0', REQUIRED",
  "ignoreList": [
    "folder path which will not exist in the 'results' folder",
    "file path which will not exist in the 'results' folder",
    "NOT REQUIRED"
  ] ,
  "scriptFileList_inject_early": [
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "scriptFileList_earlyload": [
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "scriptFileList_preload": [
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ]
}
```
For example, the easiest `info.json` file should be like:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0"
}
```

If you do not want the file `game/only-for-test.twee` be added into the game, you can write like this:
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
### About mod's files
Please follow the suggestions:
  1. For completely new and self created content, such as`create a new "Passage"`, `create a new .twee file` or `create an image file of clothing`, please do not to have the same name as the game file.
  2. For existing content that you want to overwrite, such as `redrawing a clothing image`, `adding new code to the existing "Passage"`, etc.: 
     * For an image / javascript / css file, please name it and path it exactly same as in the original game folder.
     * For a `.twee` file, please name it and path it exactly same as in the original game folder, then copy the whole passage (starting from the beginning line of this "Passage" until the end of the previous line on the next "Passage") into your mod's .twee file then modify it.
     * __It is NOT RECOMMENDED to modify existing images, javascripts or css files, please try to create new files instead of modify existing files.__
  3. Note that all "Passages" in your own mod's file should have been modified compared to the source code. If you copied a "Passage" but did not make any changes, delete it.

### Examples
1. If you want to modify the "Passage" `:: Canteen` in the `game/overworld-town/loc-school/canteen.twee` file:
   1. Create a new file: `/mods/<YOUR OWN MOD'S NAME>/game/overworld-town/loc-school/canteen.twee`.
   2. Copy the content in the `game/overworld-town/loc-school/canteen.twee` file from the line `:: Canteen` until the previous line of the line `:: Canteen Lunch` to your `/mods/<YOUR OWN MOD'S NAME>/game/overworld-town/loc-school/canteen.twee` file.
   3. Modify it in your `/mods/<YOUR OWN MOD'S NAME>/game/overworld-town/loc-school/canteen.twee` file.
2. If you want to create a new "Passage" `:: Example Mod Test Passage`:
   1. Create a new file: `/mods/<YOUR OWN MOD'S NAME>/game/example mod test.twee`.
   2. Write your new "Passage".

[dol]: https://gitgud.io/Vrelnir/degrees-of-lewdity