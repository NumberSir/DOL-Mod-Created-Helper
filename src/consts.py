from pathlib import Path

DIR_ROOT = Path(__file__).parent.parent

"""源库位置，请在这里修改，默认丢在根目录下"""
DIR_SOURCE_REPO = DIR_ROOT / "degrees-of-lewdity-master"

"""模组目录位置"""
DIR_MODS_ROOT = DIR_ROOT / "mods"

"""结果位置"""
DIR_RESULTS = DIR_ROOT / "results"

"""记录源代码中所有段落的文件"""
FILE_ALL_SOURCE_PASSAGES = DIR_ROOT / "data" / "all_source_passages.json"

"""记录源代码中所有段落的文件，只有段落名，方便查重"""
FILE_ONLY_SOURCE_PASSAGES = DIR_ROOT / "data" / "only_source_passages.json"

"""记录源代码中所有段落的文件，按文件分类，减少读写"""
FILE_FILE_SOURCE_PASSAGES = DIR_ROOT / "data" / "file_source_passages.json"

"""记录所有模组中所有段落的文件"""
FILE_ALL_MODS_PASSAGES = DIR_ROOT / "data" / "all_mods_passages.json"

"""记录所有模组中所有段落的文件，按文件分类，减少读写"""
FILE_FILE_MODS_PASSAGES = DIR_ROOT / "data" / "file_mods_passages.json"


__all__ = [
    "DIR_ROOT",
    "DIR_SOURCE_REPO",
    "DIR_MODS_ROOT",
    "DIR_RESULTS",
    "FILE_ALL_SOURCE_PASSAGES",
    "FILE_ONLY_SOURCE_PASSAGES",
    "FILE_FILE_SOURCE_PASSAGES",
    "FILE_ALL_MODS_PASSAGES",
    "FILE_FILE_MODS_PASSAGES"
]
