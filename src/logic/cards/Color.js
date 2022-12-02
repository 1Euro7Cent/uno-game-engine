const definitionConstants = require("../../constants/colors")

module.exports = class Color {
    /**
     * 
     * @param {string} color 
     */
    constructor(color) {
        if (!this.validate(color)) {
            throw new Error(`Invalid color: ${color}`)
        }
        this.color = color

    }
    validate(color = this.color) {
        return !(definitionConstants[color] === undefined)
    }

}