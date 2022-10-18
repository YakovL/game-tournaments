import axios from 'axios'

// TODO: add methods' arguments, types, implementations

// Current implementation is limited to SteamID64 in form of a string (and not BigInt);
// but it is written in an extandable manner for further support of SteamID32 (used by OpenDota and Steam API), conversions etc.
// See more at https://developer.valvesoftware.com/wiki/SteamID and https://stackoverflow.com/q/23259260/3995261
export class SteamID {
    private SteamID64: string | undefined

    constructor(id: { SteamID64String: string }) {
        if('SteamID64String' in id) this.SteamID64 = id.SteamID64String
    }

    get SteamID64String() { return this.SteamID64 }
}

export default class Dota {
    steamKey?: string;
    openDotaKey?: string;

    constructor(
        keys: { steam: string } | { openDota: string }
    ) {
        if('openDota' in keys) this.openDotaKey = keys.openDota;
        if('steam' in keys) this.steamKey = keys.steam;
    }

    // precedence: first OpenDota, then steam (adjust if needed)
    get baseUrl() {
        if(this.openDotaKey) return "https://api.opendota.com/api"
        if(this.steamKey) return "https://api.steampowered.com"
    }

    // all methods to get player id by name seem to be broken,
    // so no method for this

    async getPlayerLastMatchesIds(playerSteamID: SteamID) {
        if(this.steamKey) {
            const query = `?key=${this.steamKey}&server_steam_id=${playerSteamID.SteamID64String}`
            const url = `${this.baseUrl}/IDOTA2Match_570/GetMatchHistory/v001/${query}`
            const resp = await axios.get(url)
            if(resp.status !== 200) {
                throw Error("Request failed: " + resp.status)
            }
            const data = resp.data.result
        
            return data as {
                status: number,
                num_results: number,
                total_results: number,
                results_remaining: number,
                matches: {
                    match_id: number,
                    match_seq_num: number,
                    start_time: number, // timestamp in seconds
                    lobby_type: number, // enum
                    radiant_team_id: number,
                    dire_team_id: number,
                    players: {
                        account_id?: number, // SteamID32, is specified only for the requested player
                        player_slot: number,
                        team_number: 0 | 1,
                        team_slot: number,
                        hero_id: number
                    }[]
                }[]
            }
        } else {
            throw Error("Only steam version is implemented")
        }
    }

    async getMatchDetails() {
    }

    // feed relevant matches (ids or data) and may be player data;
    // filtering matches by time or other criteria is out of scope:
    // due to limited number of recent matches available from API (100),
    // they should be monitored, filtered, stored and retrieved by business logic anyway
    async getPlayerSummary() {
    }

    async generateSteamBotFriendLink() {
    }

    setupSteamBotListening() {
    }
}
