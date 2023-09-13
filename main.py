from src import ModIntepreted


def main():
    mod = ModIntepreted()
    mod.fetch_source_passages()     # 获取游戏已有的所有段落
    mod.validate()                  # 检查一下模组文件夹内容
    mod.fetch_mods_passages()       # 获取模组的所有段落
    mod.validate_passage()          # 检查模组段落有无重复、多余的
    mod.process_mods_passages()     # 处理模组的所有段落。重复的删除原文后拼接，新建的复制粘贴
    mod.process_mods_files()        # 处理其他文件
    mod.cover_source_files(author="chazi152")  # 覆盖原游戏文件，最好还是手动覆盖


if __name__ == '__main__':
    main()
