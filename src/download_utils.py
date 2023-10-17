from pathlib import Path
from aiofiles import open as aopen
import httpx

from .log import logger
from .langs import locale, Langs


async def chunk_split(filesize: int, chunk: int = 64) -> list[list[int]]:
    """For large files"""
    step = filesize // chunk
    arr = range(0, filesize, step)
    result = [
        [arr[i], arr[i + 1] - 1]
        for i in range(len(arr) - 1)
    ]
    result[-1][-1] = filesize - 1
    return result


async def chunk_download(url: str, client: httpx.AsyncClient, start: int, end: int, idx: int, full: int, save_path: Path):
    """For large files"""
    if not save_path.exists():
        with open(save_path, "wb"):
            pass
    headers = {"Range": f"bytes={start}-{end}"}
    response = await client.get(url, headers=headers, follow_redirects=True, timeout=60)
    async with aopen(save_path, "rb+") as fp:
        await fp.seek(start)
        await fp.write(response.content)
        logger.info(locale(Langs.ChunkDownloadInfo, idx=idx, full=full))


__all__ = [
    "chunk_split",
    "chunk_download"
]
