import chalk from 'chalk';
import * as console from "console";

export function error(...text: string[]) {
    return console.error(chalk.bold.red(...text));
}

export function warn(...text: string[]) {
    return console.error(chalk.bold.keyword("orange")(...text));
}

export function info(...text: string[]) {
    return console.error(chalk.bold.white(...text));
}