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

let instance: Dota
beforeEach(() => {
    instance = new Dota({
        steam: config.steamKey,
        openDota: config.openDotaKey,
    })
})

describe("Dota", () => {
    it("should fetch ids of last 100 matches by player id", async () => {
        const knownPlayerId = new SteamID({ SteamID64String: "76561198867994061"})
        const result = await instance.getPlayerLastMatchesIds(knownPlayerId)

        expect(result.length).toBe(100)
        expect(result[0]).toBeTruthy()
    })
})
