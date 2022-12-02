const Config = require('../Config')
const events = require('../constants/events')
const values = require('../constants/values')
const Event = require('../events/Event')
const EventManager = require('../events/EventManager')
const PlayerChangeEvent = require('../events/PlayerChangeEvent')
const PlayerDrawEvent = require('../events/PlayerDrawEvent')
const PlayerPlayEvent = require('../events/PlayerPlayEvent')

// overridable classes
let Card = require('./cards/Card')
let Deck = require('./cards/Deck')
let Player = require('./players/Player')



module.exports = class Game {
    /**
     * 
     * @param {string[]} playerNames 
     * @param {Config} config 
     */
    constructor(playerNames = [], config = new Config()) {

        this.config = config



        let ovrClasses = this.config.override.classes
        // actually overiting the classes

        // @ts-ignore
        Card = ovrClasses.Card || Card
        // @ts-ignore
        Deck = ovrClasses.Deck || Deck
        // @ts-ignore
        Player = ovrClasses.Player || Player





        this.playerNames = playerNames

        /** @type {"CW" | "CCW"}*/
        this.rotation = config.defaultRotation

        /**@type {Player}*/
        // @ts-ignore
        this.currentPlayer = null

        /**@type {"NOT_STARTED" | "PLAYING" | "STACK_DRAW" | "CONTEST"} */
        this.state = "NOT_STARTED"

        /**@type {Deck} */
        this.discardedCards = new Deck()

        /**@type {Deck[]}*/
        this.decks = []

        /**@type {Player[]}*/
        this.players = []

        /**@type {EventManager}*/
        this.eventManager = new EventManager()



    }


    /**
     * this starts the game and initializes all the players and decks
     */
    start() {
        if (this.playerNames.length < 2) throw new Error("Not enough players")
        // decks

        let decks = Math.ceil(this.playerNames.length / this.config.playersPerDeck) // 5 players / 4 players per deck = 2 decks

        for (let i = 0; i < decks; i++) {
            this.decks.push(new Deck().insertDefaultCards())
        }

        // players

        for (let name of this.playerNames) {
            let player = new Player(name)
            this.draw(player, this.config.initialCards, false, true)
            this.players.push(player)
        }

        this.currentPlayer = this.#getRandomFromArr(this.players)

        // add the first card to the discard pile
        this.discardedCards.addCard(this.#getDeck().getTopCard(true))

        this.state = "PLAYING"

    }

    /**
     * this draws cards to the selected player
     * @param {Player} player the player to deal to
     * @param {number} cards amount to draw
     * @param {boolean} silent if true, the draw event will not be fired
     */
    draw(player, cards = 1, isNext = true, silent = false, nextSilent = false) {
        let deck = this.#getDeck()
        let drawnCards = []

        for (let i = 0; i < cards; i++) {
            if (deck.cards.length > 0) {
                let card = deck.getTopCard(true)

                player.hand.addCard(card)
                drawnCards.push(card)
            }
            else {
                deck = this.#getDeck()
                i--
            }
        }

        if (!silent) this.eventManager.fireEvent(PlayerDrawEvent.fire(player, drawnCards))

        if (isNext) this.setNextPlayer(nextSilent)

    }


    /**
     * this applies all the rules to the game
     * like 4+ cards, skip, reverse, draw 2, draw 4, wild
     * @param {Player} player
     * @param {Card} card
     * @returns {boolean} if the card was valid and all actions were made
     */
    #gameLogic(player, card) {
        // reverse 
        if (card.value.value == values.REVERSE) {
            this.flipDirection()
            return true
        }

        // skip 
        if (card.value.value == values.SKIP) {
            this.setNextPlayer(true)
            return true
        }

        // draw 2 
        if (card.value.value == values.DRAW_TWO) {
            this.draw(this.getNextPlayer(), 2, true, false, true)
            return true
        }

        // draw 4
        if (card.value.value == values.WILD_DRAW_FOUR) {
            this.draw(this.getNextPlayer(), 4, true, false, true)
            return true
        }

        // wild // dos nothing that needs to be done here

        return true




    }

    /**
     * @param {Player} player
     * @param {Card} card
     */
    play(player, card) {
        if (player.hand.cards.includes(card) &&
            player == this.currentPlayer &&
            card.isValidOn(this.discardedCards.getTopCard(), true)) {

            if (typeof this.config.override.functions.gameLogic == 'function') {
                // @ts-ignore
                this.config.override.functions.gameLogic(player, card)
            }
            else this.#gameLogic(player, card)

            player.hand.removeCard(card)
            this.discardedCards.addCard(card)
            this.eventManager.fireEvent(PlayerPlayEvent.fire(player, card, this.getNextPlayer()))
            this.setNextPlayer()
            return true
        }
        else {
            return false
        }
    }


    /**
     * @returns {Player} 
     */
    getNextPlayer(rotation = this.rotation) {
        if (this.currentPlayer == null) return this.#getRandomFromArr(this.players)

        let index = this.players.indexOf(this.currentPlayer)
        if (rotation == "CW") {
            index++
            if (index >= this.players.length) index = 0
        }
        else {
            index--
            if (index < 0) index = this.players.length - 1
        }

        return this.players[index]

    }

    setNextPlayer(silent = false) {
        let currentPlayer = this.currentPlayer
        let nextPlayer = this.getNextPlayer()

        this.currentPlayer = nextPlayer

        if (!silent)
            this.eventManager.fireEvent(PlayerChangeEvent.fire(currentPlayer, nextPlayer))
    }

    flipDirection() {
        this.rotation = this.rotation == "CW" ? "CCW" : "CW"
    }

    /**
     * @param {Event} event
     * @returns {Event}
     */
    addEventListener(event) {
        return this.eventManager.addEvent(event)
    }

    /**
     * this gets the deck with the most cards
     * and when the deck is empty, it reinserts the cards from the discard pile
     */
    #getDeck() {
        let deck = this.decks[0]
        for (let i = 1; i < this.decks.length; i++) {
            if (this.decks[i].cards.length > deck.cards.length) {
                deck = this.decks[i]
            }
        }

        //todo: reinsert cards from discard pile

        return deck
    }

    /**
     * @param {any[]} arr
     */
    #getRandomFromArr(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
}