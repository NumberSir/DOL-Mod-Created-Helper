import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

/** PATHS */
export const DIR_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../");
export const DIR_REPOSITORY = path.join(DIR_ROOT, "repository")
export const DIR_GAME_REPO_ROOT = path.join(DIR_REPOSITORY, "degrees-of-lewdity")
export const DIR_MODLOADER_REPO_ROOT = path.join(DIR_REPOSITORY, "sugarcube-2-ModLoader")
export const DIR_MODLOADER_BUILT_ROOT = path.join(DIR_ROOT, "modloader")
export const DIR_GAME_TWINE = path.join(DIR_GAME_REPO_ROOT, "game");
export const DIR_DATA = path.join(DIR_ROOT, 'data');
export const DIR_DATA_PASSAGE = path.join(DIR_DATA, "passage");
export const DIR_DATA_PASSAGE_SOURCE = path.join(DIR_DATA_PASSAGE, "source");
export const DIR_MODS = path.join(DIR_ROOT, 'mods');
export const DIR_RESULTS = path.join(DIR_ROOT, 'results');

/** URLS */
export const URL_GAME_REPO = "https://gitgud.io/Vrelnir/degrees-of-lewdity";
export const URL_GAME_REPO_REMOTE = "https://gitgud.io/Vrelnir/degrees-of-lewdity.git";
export const URL_GAME_REPO_COMMITS = "https://gitgud.io/api/v4/projects/8430/repository/commits";
export const URL_GAME_REPO_ZIP = "https://gitgud.io/Vrelnir/degrees-of-lewdity/-/archive/master/degrees-of-lewdity-master.zip";
export const URL_MODLOADER_REPO = "https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader";

/** MISC */
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