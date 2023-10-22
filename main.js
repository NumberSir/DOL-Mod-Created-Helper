import {
    PreProcessModLoader,
    PreProcessModI18N,
    ProcessGamePassage,
    ProcessGamePackage
} from "./src/core.js";
import child_process from "child_process";


async function processModLoader() {
    const modLoader = new PreProcessModLoader();
    await modLoader.initDirs();
    return modLoader.downloadLatestBuiltModLoader()
}

async function processI18N() {
    const modI18N = new PreProcessModI18N();
    return modI18N.downloadLatestModI18N().then(
        () => modI18N.remoteLoadTest()
    );
}

async function processMod() {
    const gamePassage = new ProcessGamePassage("fenghuang-mods")
    await gamePassage.initDirs();
    await gamePassage.getSamePassagesMod();

    const gamePackage = new ProcessGamePackage("fenghuang-mods");
    await gamePackage.initDirs();
    await gamePackage.fetchModStructure();
    await gamePackage.writeBootJson();
    await gamePackage.packageMod();
    await gamePackage.remoteLoadTest();
}

function runLocalServer() {
    console.log("启动本地服务器...")
    child_process.exec("start http://localhost:8000/modloader/Degrees%20of%20Lewdity%20VERSION.html.mod.html");
    console.log("如果浏览器没有自动启动，请手动打开\nhttp://localhost:8080/Degrees%20of%20Lewdity%20VERSION.html.mod.html\n网页")
    child_process.exec("anywhere -s")
}

(async () => {
    const modLoader = new PreProcessModLoader();
    await Promise.all([
        processModLoader(),
        processI18N(),
        processMod()
    ]).then(
        () => {
            modLoader.extractBuiltModLoader().then(
                () => runLocalServer()
            );
        }
    )

})();