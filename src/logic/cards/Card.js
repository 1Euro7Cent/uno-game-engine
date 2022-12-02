const colors = require("../../constants/colors")
const Color = require("./Color")
const Value = require("./Value")

module.exports = class Card {
    /**
     * 
     * @param {Color | string} color 
     * @param {Value | string} value 
     */
    constructor(color, value, wild = false) {
        if (typeof color === "string") color = new Color(color)
        if (typeof value === "string") value = new Value(value)


        /** @type {Color} */
        this.color = color
        /** @type {Value} */
        this.value = value

        this.wild = wild
    }

    /**
     * returns true if this card is playable on the given card (laying it ontop of it)
     * @param {Card} card 
     * @param {boolean} toPlay if true does not accept if the card is a wild and no color is given
     * @returns {boolean} is valid
     */
    isValidOn(card, toPlay = false) {
        if (typeof card === "undefined") return false
        if (this.wild && card.wild) return false

        if (toPlay && this.wild && this.color.color == colors.BLACK) return true

        if (this.wild && this.color.color != colors.BLACK) return true
        if (this.wild && this.color.color == colors.BLACK) return false

        if (this.color.color === card.color.color) return true
        if (this.value.value === card.value.value) return true

        return false
    }

    toString() {
        return `${this.color.color} ${this.value.value}`
    }

}