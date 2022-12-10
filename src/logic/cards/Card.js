const colors = require("../../constants/colors")
const Color = require("./Color")
const Value = require("./Value")

module.exports = class Card {
    #colorI
    #valueI
    /**
     * 
     * @param {Color | string} color 
     * @param {Value | string} value 
     * @param {boolean=} wild
     */
    constructor(color, value, wild) {
        if (typeof color === "string") color = new Color(color)
        if (typeof value === "string") value = new Value(value)


        /** @type {Color} */
        this.color = color
        /** @type {Value} */
        this.value = value

        this.wild = wild || (color.isWild() && value.isWild())
        /**@type {Color} */
        // @ts-ignore
        this.wildPickedColor = wild ? new Color(colors.BLACK) : null
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


        if ((!toPlay) && this.wild) return true

        if (this.wild && this.wildPickedColor.color != colors.BLACK) return true
        if (this.wild && this.wildPickedColor.color == colors.BLACK) return false

        if (this.color.color == card.color.color) return true
        if (this.value.value == card.value.value) return true

        return false
    }

    toString() {
        return `${this.color} ${this.value}`
    }

    get color() {
        return this.#colorI
    }

    set color(color) {
        if (typeof color === "string") color = new Color(color)
        this.#colorI = color
    }

    get value() {
        return this.#valueI
    }

    set value(value) {
        if (typeof value === "string") value = new Value(value)
        this.#valueI = value
    }

}