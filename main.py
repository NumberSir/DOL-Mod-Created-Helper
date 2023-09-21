from src import ModIntepreted


def main():
    mod = ModIntepreted()
    mod.drop_results()
    mod.fetch_source_passages()     # 获取游戏已有的所有段落
    mod.validate()                  # 检查一下模组文件夹内容
    mod.fetch_mods_passages()       # 获取模组的所有段落
    mod.validate_passage()          # 检查模组段落有无重复、多余的

    # 处理模组的所有段落。重复的删除原文后拼接，新建的复制粘贴，结果会生成在 results 文件夹中
    # 接下来请使用 https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader 进行下一步操作
    # mod.process_mods_passages()

    # 如果急需测试，请去掉下面这一行代码的注释，并注释掉上面那一行代码，并用 results 文件夹中的内容覆盖游戏源文件
    # 注意这两行代码不要同时运行
    mod.process_mods_passages_rightnow()

    mod.process_mods_files()        # 处理其他文件


if __name__ == '__main__':
    main()
