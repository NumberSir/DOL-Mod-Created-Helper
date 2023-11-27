import axios from "axios";
import https from "https";
import {GITHUB_HEADERS} from "../consts";

export async function getBuiltInAddonVersion(url: string) {
    const response = await axios.get(url);
    return JSON.parse(response.data).version;
}