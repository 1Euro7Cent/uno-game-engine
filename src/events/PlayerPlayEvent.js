const events = require("../constants/events")
const Card = require("../logic/cards/Card")
const Player = require("../logic/players/Player")
const BaseEvent = require("./Event")
const FireEvent = require("./FireEvent")

module.exports = class PlayerPlayEvent extends BaseEvent {
    /**
     * 
     * @param {(player: Player, card: Card, nextPlayer: Player) => any} callback 
     */
    constructor(callback, once = false) {
        super(callback, events.PLAYER_PLAY, once)
    }

    /**
 * 
 * @param {Player} player
 * @param {Card} card
 * @param {Player} nextPlayer
 */
    static fire(player, card, nextPlayer) {
        return new FireEvent(events.PLAYER_PLAY, player, card, nextPlayer)
    }
}