import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
export const GAME_DIR = path.join(ROOT_DIR, "degrees-of-lewdity-master", "game")
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const PASSAGE_DATA_DIR = path.join(DATA_DIR, "passage")
export const MODS_DIR = path.join(ROOT_DIR, 'mods');
export const RESULTS_DIR = path.join(ROOT_DIR, 'results');

export const BOOT_KEYS = {
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