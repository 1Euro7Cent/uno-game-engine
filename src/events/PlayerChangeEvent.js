const events = require("../constants/events")
const Player = require("../logic/players/Player")
const BaseEvent = require("./Event")
const FireEvent = require("./FireEvent")

module.exports = class PlayerChangeEvent extends BaseEvent {
    /**
     * 
     * @param {(wasPlayer: Player, isPlayer: Player) => any} callback 
     */
    constructor(callback, once = false) {
        super(callback, events.PLAYER_CHANGE, once)
    }


    /**
     * 
     * @param {Player} player 
     * @param {Player} nextPlayer 
     * @returns 
     */
    static fire(player, nextPlayer) {
        return new FireEvent(events.PLAYER_CHANGE, player, nextPlayer)
    }
}