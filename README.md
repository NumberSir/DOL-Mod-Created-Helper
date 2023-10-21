## Dol Mod Created Helper

> 尝试使用 NodeJS 重构此项目

### 简介
1. 运行前:
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
2. 运行后:
   - 生成游戏所有段落/段落名，放在 `根目录/data/passage/source` 文件夹中
   - 生成模组所有段落/段落名，放在 `根目录/data/passage/<模组名>` 文件夹中
   - 生成模组与游戏相同的段落/段落名，放在 `根目录/data/passage/<模组名>` 文件夹中
   - 自动打包为可供 ModLoader 加载的模组压缩包，放在 `根目录/results` 文件夹中

[git-download]: https://git-scm.com/downloads
[nodejs-download]: https://nodejs.org/en

[modloader-repo]: https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader