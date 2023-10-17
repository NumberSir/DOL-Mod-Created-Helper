import asyncio
import contextlib
import httpx
import webbrowser

from src.consts import HOST, PORT
from src.core import GameSourceCode, GameMod
from src.exceptions import _BaseHelperException
from src.langs import locale, Langs
from src.log import logger
from src.server import app


# 是否启用本地服务器测试模组改动，使用此功能需要手动下载好 ModLoader 并如 README 所述把 "Degrees...html" 放到 "modloader" 文件夹中
# Test the mod in local server or not, which needs to download ModLoader manually and place the "Degrees...html" into "modloader" folder
REMOTE_TEST = True


async def main():
    async with httpx.AsyncClient() as client:
        game = GameSourceCode(client)
        await game.get_latest_commit()  # Judging whether download or not
        await game.download()
    game.extract()

    mod = GameMod(REMOTE_TEST)
    mod.build_boot_json()  # For ModLoader
    mod.process_results(auto_apply=False)
    mod.package()


if __name__ == '__main__':
    with contextlib.suppress(_BaseHelperException):
        asyncio.run(main())
        if REMOTE_TEST:
            webbrowser.open(f"{HOST}:{PORT}")
            logger.warning(locale(Langs.WarningWebBrowserInfo, host=HOST, port=PORT))
            app.run(host=HOST, port=PORT)

