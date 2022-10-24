import Dota, {
    SteamID,
    DotaMatchDetails,
    DotaPlayerMatchDetails,
} from "../API/dota2"
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
    it("getPlayerLastMatchesMeta should fetch ids and participation details of last 100 matches by player id", async () => {
        const knownPlayerId = new SteamID({ SteamID64String: "76561198867994061"})
        const result = await instance.getPlayerLastMatchesMeta(knownPlayerId)

        expect(result.length).toBe(100)
        expect(result[0]).toBeTruthy()
        expect(result[0].match_id).toBeDefined()
        expect(result[0].player_slot).toBeDefined()
    })

    it("should allow to get stats before the tournament, after it, and summarize the differences", async () => {
        const knownPlayerId = new SteamID({ SteamID64String: "76561198867994061"})
        const matchesMeta = await instance.getPlayerLastMatchesMeta(knownPlayerId)

        /*
            in real application, these will be the matches played during the tournament, something like:
            tournamentStart: Date
            tournamentEnd: Date
            const filteredMatchesMeta = matchesMeta.filter(({ start_time }) =>
                start_time * 1000 >= tournamentStart.getTime() &&
                start_time * 1000 < tournamentEnd.getTime())
         */
        const mockedFilteredMatchesMeta = matchesMeta.slice(0, 3)

        // in real application, there may be some queue for requests (TODO: are there limits?)
        const matchesDetails: (DotaMatchDetails & { player_slot: number })[] = []
        for(const matchMeta of mockedFilteredMatchesMeta) {
            const { player_slot } = matchMeta
            matchesDetails.push({
                player_slot,
                ...(await instance.getMatchDetails(matchMeta.match_id))
            })
        }

        const isTestFinished = false
        expect(isTestFinished).toBeTruthy()
    })
})
