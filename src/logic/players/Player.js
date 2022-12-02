const Card = require("../cards/Card")
const Deck = require("../cards/Deck")

module.exports = class Player {
    /**
     * @param {string} name
     */
    constructor(name) {
        this.name = name
        /**@type {Deck}*/
        this.hand = new Deck()
    }

    /**
     * @param {Card} card
     * @param {boolean} [toPlay]
     */
    getPlayableCards(card, toPlay) {

        return this.hand.cards.filter(c => {
            return c.isValidOn(card, toPlay)
        })

    }

    toString() {
        return this.name
    }
}