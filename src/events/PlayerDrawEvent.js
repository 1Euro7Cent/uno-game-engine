const events = require("../constants/events")
const Card = require("../logic/cards/Card")
const Player = require("../logic/players/Player")
const BaseEvent = require("./Event")
const FireEvent = require("./FireEvent")

module.exports = class PlayerDrawEvent extends BaseEvent {
    /**
 * 
 * @param {(player: Player, cards: Card[]) => any} callback 
 */
    constructor(callback, once = false) {
        super(callback, events.PLAYER_DRAW, once)
    }

    /**
     * @param {Player} player
     * @param {Card[]} cards
     */
    static fire(player, cards) {
        return new FireEvent(events.PLAYER_DRAW, player, cards)
    }

}