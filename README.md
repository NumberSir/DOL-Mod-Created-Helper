## Dol Mod Created Helper

> 尝试使用 NodeJS 重构此项目

### 简介
1. 运行前:
   - 由于本项目会用到本地服务器，在默认的命令行中执行会导致服务器自动中断，推荐使用 [WebStorm][webstorm-download] 等集成式开发环境运行本程序
   - 请先自行安装 [git][git-download] 与 [nodejs][nodejs-download]
   - 请在根目录下通过命令行或 git 交互界面运行 `git submodule update --init --recursive`
     - 自动下载游戏源码，位于 `根目录/repository/degrees-of-lewdity` 文件夹中
     - 自动下载 [ModLoader][modloader-repo] 源码，位于 `根目录/repository/sugarcube-2-ModLoader` 文件夹中
   - 请在根目录下创建 `mods` 文件夹，并在其中编写你的模组，`mods` 文件夹的结构应该类似于:
     ```text
     根目录
     - mods
       - mymods
         - boot.json
     ```
2. 运行时:
    - 自动下载游戏源码、ModLoader 源码、预编译的含 ModLoader 游戏文件、汉化模组
    - 启动本地服务器以供测试模组改动
3. 运行后:
   - 生成游戏所有段落/段落名，放在 `根目录/data/passage/source` 文件夹中
   - 生成模组所有段落/段落名，放在 `根目录/data/passage/<模组名>` 文件夹中
   - 生成模组与游戏相同的段落/段落名，放在 `根目录/data/passage/<模组名>` 文件夹中
   - 自动打包为可供 ModLoader 加载的模组压缩包，放在 `根目录/results` 文件夹中
   - 自动启动本地服务器加载汉化模组与打包好的模组，位于 `根目录/modeloader` 文件夹中

[webstorm-download]: https://www.jetbrains.com/webstorm/
[git-download]: https://git-scm.com/downloads
[nodejs-download]: https://nodejs.org/en

[modloader-repo]: https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader