import asyncio
import httpx

from src import GameSourceCode, GameMod


async def main():
    async with httpx.AsyncClient() as client:
        game = GameSourceCode(client)
        await game.get_latest_commit()  # Judging whether download or not
        await game.download()
    game.extract()

    mod = GameMod()
    mod.build_boot_json()  # For ModLoader
    mod.process_results(auto_apply=False)
    mod.package()


if __name__ == '__main__':
    asyncio.run(main())
