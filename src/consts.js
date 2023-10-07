const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT, '../data');
const MODS_DIR = path.join(ROOT, '../mods');
const RESULTS_DIR = path.join(ROOT, '../results');

const BOOT_KEYS = {
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

module.exports = {
    ROOT: ROOT,
    DATA_DIR: DATA_DIR,
    MODS_DIR: MODS_DIR,
    RESULTS_DIR: RESULTS_DIR,
    BOOT_KEYS: BOOT_KEYS,
}