import axios from 'axios'

// TODO: add methods' arguments, types, implementations

// SteamID has many forms (see https://developer.valvesoftware.com/wiki/SteamID),
// this class is meant to hold the id in one form, but construct or convert from those needed for applications.
export class SteamID {
    private SteamID64: string | undefined

    constructor(id: { SteamID64String: string }) {
        if('SteamID64String' in id) this.SteamID64 = id.SteamID64String
    }

    get SteamID64String() { return this.SteamID64 }
    get SteamID32() {
        const id64 = BigInt(this.SteamID64)
        // See https://stackoverflow.com/q/23259260/3995261
        const conversionConstant = BigInt("76561197960265728")
        return Number(id64 - conversionConstant)
    }
}

interface PlayerParticipationDetails {
    account_id?: number, // SteamID32, is specified only for the requested player
    player_slot: number,
    team_number: 0 | 1,
    team_slot: number,
    hero_id: number
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

    async getPlayerLastMatchesMeta(playerSteamID: SteamID): Promise<(
        PlayerParticipationDetails & {
            match_id: number,
            start_time: number, // timestamp in seconds
        }
    )[]> {
        if(this.steamKey) {
            const query = `?key=${this.steamKey}&server_steam_id=${playerSteamID.SteamID64String}`
            const url = `${this.baseUrl}/IDOTA2Match_570/GetMatchHistory/v001/${query}`
            const resp = await axios.get(url)
            if(resp.status !== 200) {
                throw Error("Request failed: " + resp.status)
            }
            const data = resp.data.result as {
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
                    players: PlayerParticipationDetails[]
                }[]
            }

            const playerSteamID32 = playerSteamID.SteamID32
            return data?.matches?.length ? data.matches.map(match => {
                const playerParticipation = match.players.find(p => p.account_id === playerSteamID32)
                /* match also has:
                    "match_seq_num": 5712362446,
                    "lobby_type": 7,
                    "radiant_team_id": 0,
                    "dire_team_id": 0,
                */
                return {
                    match_id: match.match_id,
                    start_time: match.start_time,
                    ...playerParticipation
                }
            }) : []
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
