import {
    PreProcessModLoader,
    PreProcessModI18N,
    ProcessGamePassage,
    ProcessGamePackage, initDirs
} from "./core";
import child_process from "child_process";
import fs from 'fs';
import {DIR_MODS} from "./consts";


async function processModLoader() {
    const modLoader = new PreProcessModLoader();
    return modLoader.downloadLatestBuiltModLoader()
}

async function processI18N() {
    const modI18N = new PreProcessModI18N();
    return modI18N.downloadLatestModI18N()
}

async function processMod() {
    const modNamesList = fs.readdirSync(DIR_MODS);

    for (const modName of modNamesList) {
        const gamePassage = new ProcessGamePassage(modName)
        const sameResults = await gamePassage.getSamePassagesMod();
        await gamePassage.preProcessForDiffGeneration(sameResults.name, sameResults.passage);

        // 尝试自动填 TweeReplacer, 暂时丢到 data/diff/<mod名>/test.json 里了
        // 要先运行一遍 test-js，再修改一下 generate-diff 末尾的模组文件夹名称，再运行 generate-diff，再运行一遍 test-js 就能看到结果了
        await gamePassage.Diff2BootJson(sameResults.name, sameResults.passage);

        const gamePackage = new ProcessGamePackage(modName);
        await gamePackage.fetchModStructure();
        await gamePackage.writeBootJson();
        await gamePackage.packageMod();
        await gamePackage.remoteLoadTest();
    }

}

function runLocalServer() {
    console.log("启动本地服务器...")
    child_process.exec("start http://localhost:8000/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html");
    console.log("如果浏览器没有自动启动，请手动打开\nhttp://localhost:8080/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html\n网页")
    child_process.exec("anywhere -s")
}

(async () => {
    const modLoader = new PreProcessModLoader();
    await initDirs();
    await Promise.all([
        processModLoader(),
        processI18N(),
        processMod(),
    // ]).then(() => runLocalServer());
    ]);
})();
