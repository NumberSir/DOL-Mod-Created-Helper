import path from "path";
import { fileURLToPath } from 'url';

export const ROOT: string = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
export const GAME_DIR: string = path.join(ROOT, "degrees-of-lewdity", "game")
export const DATA_DIR: string = path.join(ROOT, 'data');
export const PASSAGE_DATA_DIR: string = path.join(DATA_DIR, "passage")
export const MODS_DIR: string = path.join(ROOT, 'mods');
export const RESULTS_DIR: string = path.join(ROOT, 'results');

export const BOOT_KEYS: object = {
    "required": {
        "name": "",
        "version": "",

        "styleFileList": [],
        "scriptFileList": [],
        "tweeFileList": [],
        "imgFileList": [],

        "additionFile": [],
    },
    "optional": {
        "scriptFileList_inject_early": [],
        "scriptFileList_earlyload": [],
        "scriptFileList_preload": [],

        "addonPlugin": [],
        "dependenceInfo": [],

        "ignoreList": [],
    }
}