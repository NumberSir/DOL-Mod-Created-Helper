import asyncio
import webbrowser
import httpx

from src.core import GameSourceCode, GameMod
from src.consts import HOST, PORT
from src.server import app
from src.log import logger
from src.langs import locale, Langs

TOTAL_DROP = False  # Drop the whole `degrees-of-lewdity-master` folder or only `game`, `img` and `modules` folders
REMOTE_TEST = False  # Test the mod in local server or not, which needs to download ModLoader manually


async def main():
    async with httpx.AsyncClient() as client:
        game = GameSourceCode(client, total=TOTAL_DROP)
        await game.get_latest_commit()  # Judging whether download or not
        await game.download()
    game.extract()

    mod = GameMod(REMOTE_TEST)
    mod.build_boot_json()  # For ModLoader
    mod.process_results(auto_apply=False)
    mod.package()


if __name__ == '__main__':
    asyncio.run(main())
    if REMOTE_TEST:
        webbrowser.open(f"{HOST}:{PORT}")
        logger.warning(locale(Langs.WarningWebBrowserInfo, host=HOST, port=PORT))
        app.run(host=HOST, port=PORT)

