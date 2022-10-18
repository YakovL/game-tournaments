import Dota, { SteamID } from "../API/dota2"
import dotenv from "dotenv"

dotenv.config()
const config = {
    steamKey: process.env.STEAM_KEY || "",
    openDotaKey: process.env.OPENDOTA_KEY || "",
}
if(!config.steamKey && !config.openDotaKey) {
    throw new Error("Expected at least STEAM_KEY or OPENDOTA_KEY to be set in .env")
}

// TODO: cover Dota methods with tests

