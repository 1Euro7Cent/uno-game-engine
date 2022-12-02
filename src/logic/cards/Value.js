const definitionConstants = require('../../constants/values')

module.exports = class Value {
    /**
     * 
     * @param {string} value 
     */
    constructor(value) {
        if (!this.validate(value)) {
            throw new Error(`Invalid value: ${value}`)
        }
        this.value = value
    }

    validate(value = this.value) {
        return !(definitionConstants[`${value}`] === undefined)
    }
}