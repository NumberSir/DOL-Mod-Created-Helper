import asyncio
import shutil

import httpx
import json
import os

from pathlib import Path
from typing import Any
from zipfile import ZipFile, ZIP_DEFLATED

from .consts import *
from .download_utils import chunk_download, chunk_split
from .exceptions import *
from .log import *

from .langs import locale, Langs


class GameSourceCode:
    FILE_COMMITS = DIR_DATA_ROOT / "commits.json"
    FILE_GAME_ZIP = DIR_DATA_ROOT / "dol.zip"

    REPO_URL = "https://gitgud.io/Vrelnir/degrees-of-lewdity"
    REPO_COMMITS_URL = "https://gitgud.io/api/v4/projects/8430/repository/commits"
    REPO_ZIP_URL = "https://gitgud.io/Vrelnir/degrees-of-lewdity/-/archive/master/degrees-of-lewdity-master.zip"

    def __init__(self, client: httpx.AsyncClient):
        self._client = client
        self._version: str | None = None

        self._commit: dict[str, Any] | None = None
        if self.FILE_COMMITS.exists():
            with open(self.FILE_COMMITS, "r", encoding="utf-8") as fp:
                self._commit: dict[str, Any] = json.load(fp)

        self._is_latest = False
        self._download_flag = not self.FILE_GAME_ZIP.exists()

        self._drop_dirs()
        self._make_dirs()

    @staticmethod
    def _make_dirs():
        """Making directories"""
        os.makedirs(DIR_MODS_ROOT, exist_ok=True)

    async def get_latest_commit(self) -> None:
        logger.info(locale(Langs.GetLatestCommitStartInfo, url=self.REPO_COMMITS_URL))
        response = await self._client.get(self.REPO_COMMITS_URL, params={"ref_name": "master"})
        repo_json = response.json()
        latest_commit = repo_json[0]
        logger.info(locale(Langs.GetLatestCommitMsgInfo, latest_commit=latest_commit["id"]))

        self._is_latest = bool(self._commit and latest_commit["id"] == self._commit["id"])
        if self._is_latest:
            return None

        with open(self.FILE_COMMITS, "w", encoding="utf-8") as fp:
            json.dump(latest_commit, fp, ensure_ascii=False, indent=2)
        self._download_flag = self._download_flag or not self._is_latest
        logger.info(locale(Langs.GetLatestCommitFinishInfo, file=self.FILE_COMMITS))

    async def download(self):
        """ Download game source code """
        logger.info(locale(Langs.DownloadStartInfo, url=self.REPO_ZIP_URL))
        if not self._download_flag:
            logger.info(locale(Langs.DownloadAlreadyExistInfo))
            return

        flag = False
        for _ in range(3):
            try:
                response = await self._client.head(self.REPO_ZIP_URL, timeout=60, follow_redirects=True)
                filesize = int(response.headers["Content-Length"])
            except (httpx.ConnectError, KeyError):
                continue
            else:
                chunks = await chunk_split(filesize)
                flag = True
                break
        if not flag:
            logger.error(locale(Langs.DownloadErrorInfo))
            raise

        tasks = [
            chunk_download(
                self.REPO_ZIP_URL, self._client, start, end, idx, len(chunks), self.FILE_GAME_ZIP
            ) for idx, (start, end) in enumerate(chunks)
        ]
        await asyncio.gather(*tasks)
        logger.info(locale(Langs.DownloadFinishInfo, file=self.FILE_GAME_ZIP))

    def extract(self):
        """Extract zip file"""
        logger.info(locale(Langs.ExtractStartInfo))
        with ZipFile(self.FILE_GAME_ZIP, "r") as zfp:
            zfp.extractall(DIR_ROOT)
        logger.info(locale(Langs.ExtractFinishInfo))

    @staticmethod
    def _drop_dirs():
        """Cleaning"""
        logger.info(locale(Langs.DropGameDirsStartInfo))
        shutil.rmtree(DIR_SOURCE_REPO, ignore_errors=True)
        logger.info(locale(Langs.DropGameDirsFinishInfo))


class GameMod:
    def __init__(self):
        self._boot_json: dict[str, dict[str, list]] = {}

        self._drop_dirs()
        self._make_dirs()

    @staticmethod
    def _make_dirs():
        """Making directories"""
        os.makedirs(DIR_RESULTS_ROOT, exist_ok=True)
        os.makedirs(DIR_TEMP_ROOT, exist_ok=True)

    def build_boot_json(self):
        """For ModLoader"""
        logger.info(locale(Langs.BuildBootJsonStartInfo))
        if not os.listdir(DIR_MODS_ROOT):
            logger.warning(locale(Langs.BuildBootJsonNotFoundInfo))

        for name in os.listdir(DIR_MODS_ROOT):
            info_flag = False
            for dir_name in os.listdir(DIR_MODS_ROOT / name):
                if dir_name != "info.json":
                    continue
                info_flag = True
                with open(DIR_MODS_ROOT / name / "info.json", "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                self._boot_json[name] = {
                    "name": data.get("name", name),
                    "version": data.get("version", "0.0.0"),
                    "styleFileList": [],
                    "scriptFileList": [],
                    "tweeFileList": [],
                    "imgFileList": [],
                    "additionFile": []
                }
                for key in {
                    "scriptFileList_inject_early",
                    "scriptFileList_earlyload",
                    "scriptFileList_preload",
                    "ignoreList"
                }:
                    if data.get(key):
                        self._boot_json[name][key] = data[key]
                break
            if not info_flag:
                raise MissingInfoJsonException
        logger.info(locale(Langs.BuildBootJsonFinishedInfo))

    def process_results(self, auto_apply: bool = False):
        """From 'mods' to 'results'"""
        logger.info(locale(Langs.ProcessResultsStartInfo))
        for name in os.listdir(DIR_MODS_ROOT):
            for root, dir_list, file_list in os.walk(DIR_MODS_ROOT / name):
                for file in file_list:
                    filepath = Path((Path(root) / file).__str__().split(name)[1].lstrip("/").lstrip("\\"))
                    filepath_str = filepath.__str__().replace("\\", "/")
                    if self._boot_json[name].get("ignoreList") and (
                        # Ignore File
                        filepath in self._boot_json[name]["ignoreList"]

                        # Ignore Folder
                        or filepath.parent in self._boot_json[name]["ignoreList"]
                    ) or file == "info.json":
                        continue

                    # Twine
                    if file.endswith(".twee"):
                        self._process_passage(filepath, name)
                        self._boot_json[name]["tweeFileList"].append(filepath_str)

                    # JavaScript
                    elif file.endswith(".js"):
                        self._boot_json[name]["scriptFileList"].append(filepath_str)

                    # StyleSheet
                    elif file.endswith(".css"):
                        self._boot_json[name]["styleFileList"].append(filepath_str)

                    # Image
                    elif any(file.endswith(suf) for suf in {
                        ".jpg", ".png", ".gif", "svg"
                    }):
                        self._boot_json[name]["imgFileList"].append(filepath_str)

                    # Others
                    else:
                        self._boot_json[name]["additionFile"].append(filepath_str)

                    if not (DIR_RESULTS_ROOT / name / filepath).parent.exists():
                        os.makedirs((DIR_RESULTS_ROOT / name / filepath).parent, exist_ok=True)

                    shutil.copyfile(
                        Path(root) / file,
                        DIR_RESULTS_ROOT / name / filepath
                    )

                    if not file.endswith(".twee"):
                        if not (DIR_TEMP_ROOT / name / filepath).parent.exists():
                            os.makedirs((DIR_TEMP_ROOT / name / filepath).parent, exist_ok=True)
                        shutil.copyfile(
                            Path(root) / file,
                            DIR_TEMP_ROOT / name / filepath
                        )
                    if auto_apply:
                        for filedir in os.listdir(DIR_TEMP_ROOT / name):
                            if (DIR_TEMP_ROOT / name / filedir).is_file():
                                if not (DIR_SOURCE_REPO / filedir).parent.exists():
                                    os.makedirs((DIR_SOURCE_REPO / filedir).parent, exist_ok=True)
                                shutil.copyfile(
                                    DIR_TEMP_ROOT / name / filedir,
                                    DIR_SOURCE_REPO / filedir
                                )
                            else:
                                shutil.copytree(
                                    DIR_TEMP_ROOT / name / filedir,
                                    DIR_SOURCE_REPO / filedir,
                                    dirs_exist_ok=True
                                )
            with open(DIR_RESULTS_ROOT / name / "boot.json", "w", encoding="utf-8") as fp:
                json.dump(self._boot_json[name], fp, ensure_ascii=False, indent=2)
            logger.info(locale(Langs.ProcessResultsFinishModInfo, name=name))
        logger.info(locale(Langs.ProcessResultsFinishInfo))

    def _process_passage(self, filepath: Path, name: str):
        """
        1. 修改原段落
        2. 添加新段落
        3. 删除原段落
        """
        source_passages_info: list[dict] = []
        mod_passages_info: list[dict] = []
        # 不存在，直接粘到临时文件夹
        if not (DIR_SOURCE_REPO / filepath).exists():
            if not (DIR_TEMP_ROOT / name / filepath).parent.exists():
                os.makedirs((DIR_TEMP_ROOT / name / filepath).parent, exist_ok=True)
            shutil.copyfile(
                DIR_MODS_ROOT / name / filepath,
                DIR_TEMP_ROOT / name / filepath
            )
            return

        # 存在原文件，删除段落 + 拼接 后写入
        with open(DIR_MODS_ROOT / name / filepath, "r", encoding="utf-8") as fp:
            mod_lines = fp.readlines()
        with open(DIR_SOURCE_REPO / filepath, "r", encoding="utf-8") as fp:
            source_lines = fp.readlines()

        for source_idx, source_line in enumerate(source_lines):
            if not source_line.startswith("::"):
                continue
            source_line = source_line.lstrip(":: ")
            if "[" not in source_line:
                source_passages_info.append({
                    "passage": source_line.strip(),
                    "start_line": source_idx
                })
                continue
            for idx_, ch in enumerate(source_line):
                if ch != "[":
                    continue
                source_line = source_line[:idx_-1]
                source_passages_info.append({
                    "passage": source_line,
                    "start_line": source_idx
                })
                break

        for mod_idx, mod_line in enumerate(mod_lines):
            if not mod_line.startswith("::"):
                continue
            mod_line = mod_line.lstrip(":: ")
            if "[" not in mod_line:
                mod_passages_info.append({
                    "passage": mod_line.strip(),
                    "start_line": mod_idx
                })
                continue
            for idx_, ch in enumerate(mod_line):
                if ch != "[":
                    continue
                mod_line = mod_line[:idx_-1]
                mod_passages_info.append({
                    "passage": mod_line,
                    "start_line": mod_idx
                })
                break

        for source_idx, source_passage in enumerate(source_passages_info):
            if source_passage["passage"] not in {_["passage"] for _ in mod_passages_info}:
                continue

            # 不在末尾
            if source_idx != len(source_passages_info) - 1:
                slice = source_lines[source_idx: source_passages_info[source_idx+1]["start_line"]-1]
                source_lines[source_idx: source_passages_info[source_idx + 1]["start_line"] - 1] = ["" for _ in range(len(slice))]
            else:
                source_lines[source_idx:] = [""]

        source_lines.extend(mod_lines)
        if not (DIR_TEMP_ROOT / name / filepath).parent.exists():
            os.makedirs((DIR_TEMP_ROOT / name / filepath).parent, exist_ok=True)
        with open(DIR_TEMP_ROOT / name / filepath, "w", encoding="utf-8") as fp:
            fp.writelines(source_lines)
        logger.info(locale(Langs.ProcessPassageFinishInfo, filepath=filepath))

    @staticmethod
    def package():
        """Package the mod into zip file"""
        logger.info(locale(Langs.PackageStartInfo))
        for name in os.listdir(DIR_RESULTS_ROOT):
            if not os.listdir(DIR_RESULTS_ROOT / name):
                logger.warning(locale(Langs.PackageEmptyModInfo, name=name))

            with open(DIR_RESULTS_ROOT / name / "boot.json", encoding="utf-8") as fp:
                data = json.load(fp)
            filename = data["name"] or name
            with ZipFile(DIR_RESULTS_ROOT / f"{filename}.zip", "w", compression=ZIP_DEFLATED, compresslevel=5) as zfp:
                for root, dir_list, file_list in os.walk(DIR_RESULTS_ROOT / name):
                    for file in file_list:
                        zfp.write(filename=Path(root) / file, arcname=(Path(root) / file).relative_to(DIR_RESULTS_ROOT / name))
            logger.info(locale(Langs.PackageFinishModInfo, filename=filename))
        logger.info(locale(Langs.PackageFinishInfo))

    @staticmethod
    def _drop_dirs():
        """Cleaning"""
        logger.info(locale(Langs.DropResultsDirsStartInfo))
        shutil.rmtree(DIR_RESULTS_ROOT, ignore_errors=True)
        shutil.rmtree(DIR_TEMP_ROOT, ignore_errors=True)
        logger.info(locale(Langs.DropResultsDirsFinishInfo))


__all__ = [
    "GameSourceCode",
    "GameMod"
]
