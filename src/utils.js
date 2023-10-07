const fs = require('fs');
const path = require('path');

async function walkDir(dir, name){
    let result=[]

    async function traverse(dir, name){
        await fs.readdir(dir, async (err, files) => {
            for (const file of files) {
                let pathname = path.join(dir, file)
                await fs.stat(pathname, async (err, stats) => {
                    if (stats.isDirectory()) {
                        await traverse(pathname, name);
                    } else {
                        pathname = pathname.split(`\\${name}\\`)[1];
                        result.push(pathname);
                    }
                });
            }
        });
    }

    await traverse(dir, name);
    return result;
}

module.exports.walkDir = walkDir;

(async () => {
    const path = require("path");
    const ROOT = path.resolve(__dirname);
    let result = await walkDir(path.join(ROOT, '../mods/Beauty_selector'), "Beauty_selector");
}) ();