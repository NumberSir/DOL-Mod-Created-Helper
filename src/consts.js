import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
export const GAME_DIR = path.join(ROOT, "degrees-of-lewdity", "game")
export const DATA_DIR = path.join(ROOT, 'data');
export const PASSAGE_DATA_DIR = path.join(DATA_DIR, "passage")
export const MODS_DIR = path.join(ROOT, 'mods');
export const RESULTS_DIR = path.join(ROOT, 'results');

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