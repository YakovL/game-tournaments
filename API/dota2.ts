// TODO: add methods' arguments, types, implementations

export default class Dota {
    officialKey?: string;
    openDotaKey?: string;

    constructor(
        keys: { official: string } | { openDota: string }
    ) {
        if('openDota' in keys) this.openDotaKey = keys.openDota;
        if('official' in keys) this.officialKey = keys.official;
    }

    // all methods to get player id by name seem to be broken,
    // so no method for this

    async getPlayerLastMatchesIds() {
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
