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
  * [boot.json](#about-bootjson)
  * [Special Plugins & Dependence](#about-special-addon-plugins-and-dependences)
    * [TweeReplacer](#tweereplacer)
    * [ReplacePatch](#replacepatch)
    * [ImgLoaderHooker](#imageloaderhook)
    * [CheckDoLCompressorDictionaries](#checkdolcompressordictionaries)
  * [Mod's file](#about-mods-files)
  * [Examples](#examples)
---

## Description
Due to some 'features' of [Twine](https://twinery.org/) the game engine, it is very difficult to create mods for the game. Therefore I made a rough script to help create mods more easily.
Using this script requires a little bit knowledge of Python.

This script is designed to cooperate with [ModLoader](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader), you can download the latest auto-built release version [here](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/).

## How to Use

### Steps
1. [Python 3.10+](https://www.python.org/downloads/release/python-31011/) is required.
2. To install dependencies, run `pip install -r requirements.txt` in the Terminal / Shell.
3. Make yourt own mods in the `<ROOT>/mods/<YOUR OWN MODS' NAME>` directory. (Create `mods` folder manually.)
4. Run `main.py` (`python -m main`).
5. The results will be generated as a zip compressed package in the `results` folder, then please use [ModLoader](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/) to load the mod.
6. If modify the code `REMOTE_TEST = False` to `REMOTE_TEST = True` in `main.py` then run, this will automatically run a local server for the purpose of testing the mod changes

### How does the script work
1. In the beginning the script will delete `results` folder, __DO NOT put important files in it.__
2. Then the script will download the source code of the game and extract the compressed package in the root path, by default in the `degrees-of-lewdity-master` folder.
3. The script will make `boot.json` file and write most of its content (for Modloader to use).
4. The script will process your mods' content and compress it to a zip file, which could be load through [ModLoader](https://github.com/Lyoko-Jeremie/DoLModLoaderBuild/actions/).
5. If ModLoader has been downloaded and your mods needed frequently test, please change the value `REMOTE_TEST = False` to `REMOTE_TEST = True` in the `main.py` file.
   - This will automatically run a local server for the purpose of testing the mod changes, and you only need to refresh the page in the browser after the server is running.
   - Default url is `http://localhost:52525`

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
 │       ├── boot.json <REQUIRED>
 │       ├── img (images-ish files, please refer to the source code of the game)
 │       ├── game (.twee-ish files, please refer to the source code of the game)
 │       ├── modules 
 │       │   └── css (.css-ish files, please refer to the source code of the game)
 │      ... 
 ├── modloader (which is needed to download manually)
 │   ├── mods (automatically copy the results here)
 │   ├── Degrees of Lewdity VERSION.mod.html (game file but with ModLoader inside) <REQUIRED if the value `REMOTE_TEST` has been set to `True` in the `main.py` file>
 │  ... 
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

### About boot.json
Please fill in the following information in the file `boot.json`：
```json
{
  "name": "The name of your mod, like 'Example Mod', REQUIRED", 
  "version": "The version of your mod, like '1.0.0', REQUIRED",
  "additionFile": [
    "File path that needed to be added into the zip file",
    "NOT REQUIRED"
  ],
  "scriptFileList_inject_early": [
    "The paths of javascript files which are needed to be injected early and works as <script> tag works",
    "More info please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "scriptFileList_earlyload": [
    "The paths of javascript files which are needed to be loaded early, running after 'inject_early' files all have been injected done",
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "scriptFileList_preload": [
    "The paths of javascript files which are needed to run before SugarCube2 merge data of mods into 'tw-storydata'",
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "addonPlugin": [
    "The information of those addon-plugins this mod needs, there will be warning messages in the loading logs if any addon mismatched",
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ],
  "dependenceInfo": [
    "The information of those dependences this mod needs, there will be warning messages in the loading logs if any dependence mismatched",
    "Please refer to ModLoader docs",
    "NOT REQUIRED"
  ]
}
```
For example, the easiest `boot.json` file should be like:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0"
}
```

If you want the file `README.md` to be added into the game, you can write like this:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0",
  "additionFile": [
    "README.md"
  ]
}
```

---

### About special addon-plugins and dependences

#### TweeReplacer

> [repo](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_TweeReplacer/)

If there are any changes on `.twee` file in the original game source code written in your mod, please add this addon and fill in corresponding parameters:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "TweeReplacer",
      "addonName": "TweeReplacerAddon",
      "modVersion": "1.0.0",
      "params": [
        {
          "passage": "<Passage name where the text needed to be replaced located, which means texts after `::` mark, and contents in square brackets `[]` are not included>",
          "findString": "<Plain text needed to be replaced, used as reference in source code, only one of this param and `findRegex` is needed>",
          "findRegex": "<Regular expression used as reference in source code, only one of this param and `findString` is needed>",
          "replace": "<Plain text that `findString` will be replaced to, only one of this param and `replaceFile` is needed>",
          "replaceFile": "<The path of text file which contains plain text that `findString` will be replaced to, only one of this param and `replace` is needed>"
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

For instance, if you have added 2 lines of codes in `game/04-Variables/variables-start.twee`:
```text
...
:: gameStartOnly [widget]   /* Passage Name: gameStartOnly */
...
    ...
    <<set $fenghuangbuild to 0>>    /* New added */
    <<set $fenghuang to 0>>         /* New added */
    <<set $stray_happiness to 50>>  /* Already exists */
    ...
```
Your `boot.json` should be like:
```json
{
  "name": "EXAMPLE MOD",
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

> [repo](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_ReplacePatch/)

If there are any changes on `.js` / `.css` file in the original game source code written in your mod, please add this addon and fill in corresponding parameters:
```json
{
  "name": "EXAMPLE MOD",
  "version": "1.0.0",
  "addonPlugin": [
    {
      "modName": "ReplacePatcher",
      "addonName": "ReplacePatcherAddon",
      "modVersion": "1.0.0",
      "params": {
        "js": [
          {
            "from": "<Plain text needed to be replaced>",
            "to": "<Plain text that `from` will be replaced to>",
            "fileName": "<The name of the javascript file>"
          }
        ],
        "css": [
          {
            "from": "<Plain text needed to be replaced>",
            "to": "<Plain text that `from` will be replaced to>",
            "fileName": "<The name of the style sheet file>"
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

For instance, if you have added 1 line of codes in `game/03-JavaScript/ingame.js`:

```text
...
if (V.fox >= 6) modifier += 0.10;        /* Already exists */
if (V.fenghuang >= 6) modifier += 0.10;  /* New added */
result = Math.floor(result * modifier);  /* Already exists */
...
```
Your `boot.json` should be like:
```json
{
  "name": "EXAMPLE MOD",
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

> [repo](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader-ImgLoaderHooker/)

If there are any images in your mod, please add this dependence:
```json
{
  "name": "EXAMPLE MOD",
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

> [repo](https://github.com/Lyoko-Jeremie/Degrees-of-Lewdity_Mod_CheckDoLCompressorDictionaries/)

This dependence is only used to check if `DoLCompressorDictionaries` has been modified, because this may result in incompatible savedata
```json
{
  "name": "EXAMPLE MOD",
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