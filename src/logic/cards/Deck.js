const Card = require("./Card")
const cardCounts = require("../../constants/cardCounts")
const colors = require("../../constants/colors")

module.exports = class Deck {
    constructor() {
        /**
         * @type {Card[]}
         */
        this.cards = []
    }

    /**
     * 
     * @param {boolean} remove 
     * @returns {Card}
     */
    getTopCard(remove = false) {
        // @ts-ignore
        if (remove) return this.cards.shift()

        return this.cards[this.cards.length - 1]
    }

    /**
     * @param {Card} card
     */
    removeCard(card) {
        this.cards = this.cards.filter(c => c !== card)
    }

    /**
     * @param {Card} card
     */
    addCard(card) {
        this.cards.push(card)
    }




    /**
     * this inserts default cards into the deck
     * @returns {Deck}
     */
    insertDefaultCards() {
        this.cards = []
        for (const color in cardCounts) {
            for (const value in cardCounts[color]) {
                for (let i = 0; i < cardCounts[color][value]; i++) {
                    this.addCard(new Card(color, value, color == colors.BLACK))
                }
            }
        }

        this.shuffle()
        return this

    }

    /**
     * this shuffles the deck
     * @returns {Deck}
     */
    shuffle() {
        this.cards.sort(() => Math.random() - 0.5)
        return this
    }
}