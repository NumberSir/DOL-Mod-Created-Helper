import json
from pathlib import Path
import locale


DIR_ROOT = Path(__file__).parent.parent

DIR_DATA_ROOT = DIR_ROOT / "data"
DIR_LANGS_ROOT = DIR_DATA_ROOT / "langs"
DIR_MODS_ROOT = DIR_ROOT / "mods"
DIR_RESULTS_ROOT = DIR_ROOT / "results"
DIR_TEMP_ROOT = DIR_DATA_ROOT / "tmp"
DIR_SOURCE_REPO = DIR_ROOT / "degrees-of-lewdity-master"

FILE_ALL_SOURCE_PASSAGES = DIR_DATA_ROOT / "all_source_passages.json"
FILE_ONLY_SOURCE_PASSAGES = DIR_DATA_ROOT / "only_source_passages.json"
FILE_FILE_SOURCE_PASSAGES = DIR_DATA_ROOT / "file_source_passages.json"
FILE_ALL_MODS_PASSAGES = DIR_DATA_ROOT / "all_mods_passages.json"
FILE_FILE_MODS_PASSAGES = DIR_DATA_ROOT / "file_mods_passages.json"

SYS_LANG = (locale.getdefaultlocale()[0]).lower()  # zh_cn
LANG_FILE = DIR_LANGS_ROOT / f"{SYS_LANG}.json"
LANG_FILE = LANG_FILE if LANG_FILE.exists() else DIR_LANGS_ROOT / "en_us.json"
with open(LANG_FILE, "r", encoding="utf-8") as fp:
    LANGS = json.load(fp)
with open(DIR_LANGS_ROOT / "en_us.json", "r", encoding="utf-8") as fp:
    DEFAULT_LANGS = json.load(fp)

__all__ = [
    "DIR_ROOT",
    "DIR_SOURCE_REPO",
    "DIR_MODS_ROOT",
    "DIR_RESULTS_ROOT",
    "DIR_TEMP_ROOT",
    "DIR_DATA_ROOT",
    "DIR_LANGS_ROOT",
    "FILE_ALL_SOURCE_PASSAGES",
    "FILE_ONLY_SOURCE_PASSAGES",
    "FILE_FILE_SOURCE_PASSAGES",
    "FILE_ALL_MODS_PASSAGES",
    "FILE_FILE_MODS_PASSAGES",
    "LANGS",
    "DEFAULT_LANGS"
]
