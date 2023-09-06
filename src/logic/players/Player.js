const Card = require("../cards/Card")
const Deck = require("../cards/Deck")

module.exports = class Player {
    /**
     * @param {string} name
     * @param {number} id
     */
    constructor(name, id) {
        this.name = name
        /**@type {Deck}*/
        this.hand = new Deck()
        this.id = id ?? -1
    }

    /**
     * @param {Card} card
     * @param {boolean} [toPlay]
     * @param {boolean} [isStacking]
     */
    getPlayableCards(card, toPlay, isStacking = false) {

        return this.hand.cards.filter(c => {
            return c.isValidOn(card, toPlay, isStacking)
        })

    }

    toString() {
        return this.name
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            hand: this.hand.toJSON()
        }
    }

    static fromJSON(json) {
        let player = new Player(json.name, json.id)
        player.hand = Deck.fromJSON(json.hand)
        return player
    }
}