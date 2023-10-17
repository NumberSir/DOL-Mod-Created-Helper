from pathlib import Path
from typing import Any

from .langs import locale, Langs


class _BaseHelperException(Exception):
    def __init__(self, msg: str = locale(Langs.BaseHelperExceptionMsg), detail: Any = None):
        self._msg = msg
        self._detail = detail

    def __str__(self):
        return f"{self._msg} - {self._detail}" if self._detail else self._msg

    def __repr__(self):
        return self.__str__()


class DownloadError(_BaseHelperException):
    def __init__(self):
        super().__init__(
            msg=locale(Langs.DownloadErrorInfo)
        )


class NonExistenceSourceCodeException(_BaseHelperException):
    def __init__(self):
        super().__init__(
            msg=locale(Langs.NonExistenceSourceCodeExceptionMsg)
        )


class MissingBootJsonException(_BaseHelperException):
    def __init__(self):
        super().__init__(
            msg=locale(Langs.MissingBootJsonExceptionMsg)
        )


class NonExistenceModloaderException(_BaseHelperException):
    def __init__(self):
        super().__init__(
            msg=locale(Langs.NonExistenceModloaderExceptionMsg)
        )


__all__ = [
    "DownloadError",
    "NonExistenceSourceCodeException",
    "MissingBootJsonException",
    "NonExistenceModloaderException"
]