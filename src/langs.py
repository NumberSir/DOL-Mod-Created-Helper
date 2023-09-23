from .consts import LANGS, DEFAULT_LANGS
from enum import Enum


class Langs(Enum):
    # exceptions
    BaseHelperExceptionMsg = 0
    NonExistenceSourceCodeExceptionMsg = 1
    MissingInfoJsonExceptionMsg = 2

    # core
    GetLatestCommitStartInfo = 3
    GetLatestCommitMsgInfo = 4
    GetLatestCommitFinishInfo = 5

    DownloadStartInfo = 6
    DownloadAlreadyExistInfo = 7
    DownloadErrorInfo = 8
    DownloadFinishInfo = 9

    ExtractStartInfo = 10
    ExtractFinishInfo = 11

    DropGameDirsStartInfo = 12
    DropGameDirsFinishInfo = 13

    BuildBootJsonStartInfo = 14
    BuildBootJsonNotFoundInfo = 15
    BuildBootJsonFinishedInfo = 16

    ProcessResultsStartInfo = 17
    ProcessResultsFinishModInfo = 18
    ProcessResultsFinishInfo = 19

    PackageStartInfo = 20
    PackageEmptyModInfo = 21
    PackageFinishModInfo = 22
    PackageFinishInfo = 23

    DropResultsDirsStartInfo = 24
    DropResultsDirsFinishInfo = 25

    ProcessPassageFinishInfo = 26


def locale(raw: Langs | str, **kwargs):
    text = raw.name if isinstance(raw, Langs) else raw
    return LANGS.get(
        text,
        DEFAULT_LANGS.get(text, "")
    ).format(**kwargs)


__all__ = [
    "locale",
    "Langs"
]