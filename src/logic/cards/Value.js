const definitionConstants = require('../../constants/values')

module.exports = class Value {
    /**
     * 
     * @param {string} value 
     */
    constructor(value) {
        if (this.validate(value)) this.value = value
    }

    validate(value = this.value) {
        return !(definitionConstants[`${value}`] === undefined)
    }

    isWild() {
        return this.value == definitionConstants.WILD || this.value == definitionConstants.WILD_DRAW_FOUR
    }

    toString() {
        return this.value
    }

    toJSON() {
        return this.value
    }

    static fromJSON(json) {
        return new Value(json)
    }
}