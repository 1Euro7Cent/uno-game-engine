module.exports = class Config {
    constructor() {

        this.initialCards = 7
        this.playersPerDeck = 4
        /**
         * @type {"CW" | "CCW"}
         */
        this.defaultRotation = "CW" // CW or CCW

        this.override = {
            classes: {
                Player: undefined,
                Deck: undefined,
                Card: undefined,
            },
            functions: {
                gameLogic: undefined

            }
        }

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