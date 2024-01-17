## Dol Mod Created Helper

> 尝试使用 NodeJS 重构此项目

### 简介
1. 运行前的准备工作:
   1. 由于本项目会用到本地服务器，在默认的命令行中执行会导致服务器自动中断，推荐使用 [WebStorm][webstorm-download] 等集成式开发环境运行本程序
   2. 请先自行安装 [git][git-download] 与 [nodejs][nodejs-download]
   3. 请在根目录下通过命令行或 git 交互界面运行下行命令以初始化子模块：
      ```shell
      git submodule update --init --recursive
      ```
     - 自动获取[游戏源码][dol-repo]，位于 `./repository/degrees-of-lewdity` 文件夹中
     - 自动获取 [ModLoader 源码][modloader-repo]，位于 `./repository/sugarcube-2-ModLoader` 文件夹中
   4. 请在根目录下创建 `mods` 文件夹，并在其中编写你的模组，`mods` 文件夹的结构应该类似于:
      ```text
      根目录
      - mods
        - mymods
          - boot.json
      ```
   5. 请在根目录下创建 `.env` 文件，并在其中填写你的 GITHUB_TOKEN:
      ```dotenv
      GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      ```
   6. 请在根目录下使用如下命令安装依赖:
      ```shell
      npm install
      ```
   7. 请进入 `./repository/sugarcube-2-ModLoader` 目录中，使用如下命令安装依赖:
      ```shell
      npm install
      ```
      或
      ```shell
      yarn install
      ```
   8. 仍然在 `./repository/sugarcube-2-ModLoader` 目录中，请依次运行 `package.json` 中的 6 条命令:
      ```shell
      tsc -p ./src/BeforeSC2/tsconfig.json
      webpack -c ./webpack.config.js
      webpack -c ./webpack-comp.config.js
      tsc -p ./src/ForSC2/tsconfig.json
      webpack -c ./webpack-insertTools.config.js
      babel dist-BeforeSC2-comp -d dist-BeforeSC2-comp-babel
      ```
   9. 请进入 `./repository/sugarcube-2-ModLoader/mod/Diff3WayMerge` 目录中，使用如下命令安装依赖:
      ```shell
      npm install
      ```
      或
      ```shell
      yarn install
      ```
   10. 仍然在 `./repository/sugarcube-2-ModLoader/mod/Diff3WayMerge` 目录中，请依次运行 `package.json` 中的 3 条命令:
      ```shell
      tsc -p ./src_boot/tsconfig.json
      webpack -c ./webpack.config.js
      webpack -c ./webpack-tool.config.js
      ```
2. 运行时:
   1. 编写模组完成后，请在根目录下运行 `package.json` 中的命令 `build`:
      ```shell
      webpack -c ./webpack.config.js
      ```
   2. 请在根目录下运行 `package.json` 中的命令 `test-js`:
      ```shell
      node ./dist/main.js "."
      ```
   3. 请在根目录下运行 `package.json` 中的命令 `generate-diff`，注意在运行前修改命令末尾的文件夹名称:
      ```shell
      node ./repository/sugarcube-2-ModLoader/mod/Diff3WayMerge/dist-tool/make-mod-diff.js ./data/diff/<这里是你的模组文件夹名称>
      ```
   4. 请在根目录下再次运行 `package.json` 中的命令 `test-js`:
      ```shell
      node ./dist/main.js "."
      ```
   5. 结果会呈现在 `./results` 目录中

3. 运行后:
   - 生成游戏所有段落/段落名，放在 `./data/passage/source` 文件夹中
   - 生成模组所有段落/段落名，放在 `./data/passage/<模组名>` 文件夹中
   - 生成模组与游戏相同的段落/段落名，放在 `./data/passage/<模组名>` 文件夹中
   - 自动打包为可供 ModLoader 加载的模组压缩包，放在 `./results` 文件夹中
   - 自动启动本地服务器加载汉化模组与打包好的模组，位于 `./modeloader` 文件夹中

[webstorm-download]: https://www.jetbrains.com/webstorm/
[git-download]: https://git-scm.com/downloads
[nodejs-download]: https://nodejs.org/en

[dol-repo]: https://gitgud.io/Vrelnir/degrees-of-lewdity
[modloader-repo]: https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader