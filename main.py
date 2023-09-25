import asyncio
import httpx

from src import GameSourceCode, GameMod

TOTAL_DROP = False  # Drop the whole `degrees-of-lewdity-master` folder or only `game`, `img` and `modules` folders


async def main():
    async with httpx.AsyncClient() as client:
        game = GameSourceCode(client, total=TOTAL_DROP)
        await game.get_latest_commit()  # Judging whether download or not
        await game.download()
    game.extract()

    mod = GameMod()
    mod.build_boot_json()  # For ModLoader
    mod.process_results(auto_apply=False)
    mod.package()


if __name__ == '__main__':
    asyncio.run(main())
