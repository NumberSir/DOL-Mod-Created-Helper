import {
    PreProcessModLoader,
    PreProcessModI18N,
    ProcessGamePassage,
    ProcessGamePackage, initDirs
} from "./core";
import child_process from "child_process";
import fs from 'fs';
import {DIR_MODS} from "./consts";
import {AddonTweeReplacer} from "./builtins/twee-replacer";
import {INFO, WARN} from "./log";


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


        const gamePackage = new ProcessGamePackage(modName);
        await gamePackage.fetchModStructure();
        await gamePackage.writeBootJson();
        // 尝试自动填 TweeReplacer
        // 要先运行一遍 test-js，再修改一下 generate-diff 末尾的模组文件夹名称，再运行 generate-diff，再运行一遍 test-js 就能看到结果了
        try {
            const addonTweeReplacer = await gamePassage.diff2BootJson(sameResults.name, sameResults.passage);
            await gamePackage.writeBootJsonTweeReplacer(addonTweeReplacer);
        } catch (err) {
            console.warn(WARN(`[WARN] error while running writeBootJsonTweeReplacer(): `), err)
        }
        await gamePackage.packageMod();
        await gamePackage.remoteLoadTest();
    }

}

function runLocalServer() {
    console.info(INFO("启动本地服务器..."))
    child_process.exec("start http://localhost:8000/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html");
    console.warn(WARN("如果浏览器没有自动启动，请手动打开\nhttp://localhost:8080/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html\n网页"))
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
