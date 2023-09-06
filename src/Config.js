module.exports = class Config {
    constructor() {

        this.initialCards = 7
        this.playersPerDeck = 4
        /**
         * @type {"CW" | "CCW"}
         */
        this.defaultRotation = "CW" // CW or CCW

        this.stackCards = false

        this.override = {
            classes: {
                Player: undefined,
                Deck: undefined,
            },
            functions: {
                gameLogic: undefined

            }
        }

    }

    toJSON() {
        return {
            initialCards: this.initialCards,
            playersPerDeck: this.playersPerDeck,
            defaultRotation: this.defaultRotation
        }
    }

    /**
     * @param {{ 
     * initialCards: number; 
     * playersPerDeck: number; 
     * defaultRotation: "CW" | "CCW"; 
     * }} json
     */
    static fromJSON(json) {
        let config = new Config()
        config.insertValues(json)
        return config
    }

    insertValues(json) {
        this.initialCards = json.initialCards
        this.playersPerDeck = json.playersPerDeck
        this.defaultRotation = json.defaultRotation
        this.stackCards = json.stackCards
    }

    /**
     * 
     * @param {any} v 
     * @returns {boolean} true if v is a class. if undefined, returns false
     */
    #isClass(v) {
        return typeof v === 'function' && /^\s*class\s+/.test(v.toString())
    }

    /**
     * @param {boolean} stackCards
     * @returns {Config}
     */
    setStackCards(stackCards) {
        this.stackCards = stackCards
        return this
    }

    /**
     * @param {number} initialCards
     * @returns {Config}
     */
    setInitialCards(initialCards) {
        this.initialCards = initialCards
        return this
    }

    /**
     * @param {number} playersPerDeck
     * @returns {Config}
     */
    setPlayersPerDeck(playersPerDeck) {
        this.playersPerDeck = playersPerDeck
        return this
    }

    /**
     * @param {"CW" | "CCW"} defaultRotation
     * @returns {Config}
     */
    setDefaultRotation(defaultRotation) {
        this.defaultRotation = defaultRotation
        return this
    }
}