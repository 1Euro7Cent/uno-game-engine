const definitionConstants = require("../../constants/colors")

module.exports = class Color {
    /**
     * 
     * @param {string} color 
     */
    constructor(color) {
        if (this.validate(color)) this.color = color

    }
    validate(color = this.color) {
        return !(definitionConstants[`${color}`] === undefined)
    }

    isWild() {
        return this.color == definitionConstants.BLACK
    }

    toString() {
        return this.color
    }

    toJSON() {
        return this.color
    }

    static fromJSON(json) {
        return new Color(json)
    }
}