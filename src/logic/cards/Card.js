const colors = require("../../constants/colors")
const values = require("../../constants/values")
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
        // console.log(this.wild)
        /**@type {Color} */
        // @ts-ignore
        this.wildPickedColor = this.wild ? new Color(colors.BLACK) : null
    }

    /**
     * returns true if this card is playable on the given card (laying it ontop of it)
     * @param {Card} card 
     * @param {boolean} toPlay if true does not accept if the card is a wild and no color is given
     * @param {boolean} isStacking if true, handle the card if it can be stacked on top of the given card
     * @returns {boolean} is valid
     */
    isValidOn(card, toPlay = false, isStacking = false) {
        if (typeof card === "undefined") return false

        if (isStacking) {
            if (this.value.value == values.DRAW_TWO) return card.value.value == this.value.value
            if (this.value.value == values.WILD_DRAW_FOUR) return card.value.value == this.value.value

            return false
        }


        if (this.wild && card.wild) return false


        if ((!toPlay) && this.wild) return true

        if (this.wild && this.wildPickedColor?.color != colors.BLACK) return true
        if (this.wild && this.wildPickedColor?.color == colors.BLACK) return false

        if (this.color.color == card.color.color) return true
        if (this.value.value == card.value.value) return true

        return false
    }

    toString() {
        return `${this.color} ${this.value}`
    }

    /**
     * @returns {Color}
     */
    get color() {
        return this.#colorI
    }

    set color(color) {
        if (typeof color === "string") color = new Color(color)
        // this.wild = color.isWild() && this.value.isWild()
        this.#colorI = color
    }

    /**
     * @returns {Value}
     */
    get value() {
        return this.#valueI
    }

    set value(value) {
        if (typeof value === "string") value = new Value(value)
        // this.wild = this.color.isWild() && value.isWild()
        this.#valueI = value
    }

    toJSON() {
        return {
            color: this.color.toJSON(),
            value: this.value.toJSON(),
            wild: this.wild,
            wildPickedColor: this.wildPickedColor?.toJSON()
        }
    }

    static fromJSON(json) {
        let card = new Card(Color.fromJSON(json.color), Value.fromJSON(json.value), json.wild)
        if (json.wildPickedColor) card.wildPickedColor = Color.fromJSON(json.wildPickedColor)
        return card
    }

}