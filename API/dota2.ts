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

export interface DotaPlayerMatchDetails {
    account_id?: number,
    player_slot: number,
    team_number: number,
    team_slot: number,

    hero_id: number,
    item_0: number,
    item_1: number,
    item_2: number,
    item_3: number,
    item_4: number,
    item_5: number,
    backpack_0: number,
    backpack_1: number,
    backpack_2: number,
    item_neutral: number,

    kills: number,
    deaths: number,
    assists: number,
    last_hits: number,
    gold_per_min: number,
    xp_per_min: number,
    hero_damage: number,
    tower_damage: number,
    hero_healing: number,
    gold: number,
    gold_spent: number,
    scaled_hero_damage: number,
    scaled_tower_damage: number,
    scaled_hero_healing: number,

    leaver_status: number,
    denies: number,
    level: number,
    net_worth: number,
    aghanims_scepter: number,
    aghanims_shard: number,
    moonshard: number,
    ability_upgrades: {
        ability: number,
        time: number,
        level: number
    }[]
}

export interface DotaMatchDetails {
    // can be mapped to the region: https://github.com/kronusme/dota2-api/blob/master/data/regions.json
    cluster: number,

    players: DotaPlayerMatchDetails[],

    duration: number,
    pre_game_duration: number,
    start_time: number, // timestamp in seconds                
    lobby_type: number,
    leagueid: number,
    game_mode: number,
    first_blood_time: number,
    human_players: number,
    positive_votes: number,
    negative_votes: number,
    flags: number,
    engine: number,
    picks_bans: {
        is_pick: boolean,
        hero_id: number,
        team: number,
        order: number
    }[],

    radiant_win: boolean,
    tower_status_radiant: number,
    tower_status_dire: number,
    barracks_status_radiant: number,
    barracks_status_dire: number,
    radiant_score: number,
    dire_score: number,

    // can hide
    match_id: number,
    match_seq_num: number,
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

    async getMatchDetails(matchId: number): Promise<DotaMatchDetails> {
        if(this.steamKey) {
            const query = `?key=${this.steamKey}&match_id=${matchId}`
            const url = `${this.baseUrl}/IDOTA2Match_570/GetMatchDetails/v001/${query}`
            const resp = await axios.get(url)
            if(resp.status !== 200) {
                throw Error("Request failed: " + resp.status)
            }
            return resp.data.result as DotaMatchDetails
        } else {
            throw Error("Only steam version is implemented")
        }
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
