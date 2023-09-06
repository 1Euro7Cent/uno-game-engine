const Card = require("./Card")
const cardCounts = require("../../constants/cardCounts")
const colors = require("../../constants/colors")
const Color = require("./Color")
const Value = require("./Value")
const values = require("../../constants/values")

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

        return this.cards[0]
    }

    /**
     * 
     * @param {Color | string} [color] the color to find. if not provided, ignores color
     * @param {Value | string} [value] the value to find. if not provided, ignores value
     * @returns {Card | null}
     */
    getCard(color, value) {
        if (typeof color === "undefined" && typeof value === "undefined") return null
        if (typeof color === "string") color = new Color(color)
        if (typeof value === "string") value = new Value(value)

        let isWild = typeof value !== "undefined" ? value.isWild() : false
        // console.log(`ISWILD: ${isWild}`)

        let card = this.cards.find(c => {

            // let retValue = (isWild || c.color.color == color) && c.value.value == value

            let matchColor = (isWild || c.color.color == color) || typeof color === "undefined"
            let matchValue = c.value.value == value || typeof value === "undefined"


            // console.log(`TOTAL EXP: ${retValue}`)
            return matchColor && matchValue
        })
        // console.log(`CARD: ${card}`)

        if (!card) return null

        if (card.wild) {
            // @ts-ignore
            card.wildPickedColor = color
        }

        return card
    }

    getColorCounts() {
        let counts = {}
        for (let card of this.cards) {
            if (!counts[card.color]) counts[card.color] = 0
            counts[card.color]++
        }
        return counts
    }




    /**
     * @param {Card} card
     * @returns {boolean} true if the card was removed
     */
    removeCard(card) {
        if (this.cards.includes(card)) {
            this.cards = this.cards.filter(c => c !== card)
        }
        else
            if (this.cards.find(c => c.color == card.color && c.value == card.value)) {
                this.cards = this.cards.filter(c => c.color != card.color && c.value != card.value)
            }

            else {
                return false
            }
        return true
    }

    /**
     * @param {Card} card
     */
    addCard(card) {
        this.cards.unshift(card)
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

    toJSON() {
        return this.cards.map(c => c.toJSON())
    }

    static fromJSON(json) {
        let deck = new Deck()
        deck.cards = json.map(c => Card.fromJSON(c))
        return deck
    }
}