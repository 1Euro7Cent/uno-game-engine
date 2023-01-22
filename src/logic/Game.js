const Config = require('../Config')
const colors = require('../constants/colors')
const events = require('../constants/events')
const values = require('../constants/values')
const Event = require('../events/Event')
const EventManager = require('../events/EventManager')
const PlayerChangeEvent = require('../events/PlayerChangeEvent')
const PlayerDrawEvent = require('../events/PlayerDrawEvent')
const PlayerPlayEvent = require('../events/PlayerPlayEvent')
const Card = require('./cards/Card')

// overridable classes
let Deck = require('./cards/Deck')
let Player = require('./players/Player')



module.exports = class Game {
    /**
     * 
     * @param {string[]} playerNames 
     * @param {Config} config 
     */
    constructor(playerNames = [], config = new Config()) {

        if (!Array.isArray(playerNames)) throw new Error("PlayerNames must be an array")
        if (!(config instanceof Config)) throw new Error("Config must be an instance of Config")



        this.config = config



        let ovrClasses = this.config.override.classes
        // actually overiting the classes

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
        if (this.state != "NOT_STARTED") throw new Error("Game already started")
        // decks

        let decks = Math.ceil(this.playerNames.length / this.config.playersPerDeck) // 5 players / 4 players per deck = 2 decks

        for (let i = 0; i < decks; i++) {
            this.decks.push(new Deck().insertDefaultCards())
        }

        // players

        for (let i in this.playerNames) {
            let name = this.playerNames[i]
            let player = new Player(name, parseInt(i))
            this.draw(player, this.config.initialCards, false, true)
            this.players.push(player)
        }

        this.currentPlayer = this.#getRandomFromArr(this.players)

        // add the first card to the discard pile
        // this.discardedCards.addCard(this.#getDeck().getTopCard(true))
        let deck = this.#getDeck()
        let validFirstCards = deck.cards.filter(c =>
            c.color.color != colors.BLACK &&
            c.value.value != values.DRAW_TWO &&
            c.value.value != values.REVERSE &&
            c.value.value != values.SKIP
        )

        let card = this.#getRandomFromArr(validFirstCards)
        this.discardedCards.addCard(card)
        deck.removeCard(card)

        this.state = "PLAYING"

    }

    /**
     * this draws cards to the selected player
     * @param {Player} player the player to deal to
     * @param {number} cards amount to draw
     * @param {boolean} silent if true, the draw event will not be fired
     * @param {boolean} nextSilent if true, the next player event will not be fired
     */
    draw(player, cards = 1, isNext = true, silent = false, nextSilent = false) {
        // user input validation
        if (!player) throw new Error("No player provided")
        if (!(player instanceof Player)) throw new Error("Player must be an instance of Player")

        if (typeof cards != "number") throw new Error("Cards must be a number")
        if (cards < 1) throw new Error("Cards must be greater than 0")
        if (!Number.isInteger(cards)) throw new Error("Cards must be an integer")

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
                if (deck.cards.length == 0) break
                i--
            }
        }

        if (!silent) this.eventManager.fireEvent(PlayerDrawEvent.fire(player, drawnCards))

        if (isNext) this.setNextPlayer(nextSilent)

        if (drawnCards.length == cards) return true
        return false

    }


    /**
     * this applies all the rules to the game
     * like 4+ cards, skip, reverse, draw 2, draw 4, wild
     * @param {Player} player
     * @param {import("./cards/Card")} card
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
     * @returns {boolean} success
     */
    play(player, card) {
        // user input validation
        if (!player) throw new Error("No player provided")
        if (!(player instanceof Player)) throw new Error("Player must be an instance of Player")

        if (!card) throw new Error("No card provided")
        if (!(card instanceof Card)) throw new Error("Card must be an instance of Card")


        if (player.hand.cards.includes(card) &&
            player == this.currentPlayer &&
            card.isValidOn(this.discardedCards.getTopCard(), true)) {

            if (card.wild) card.color = card.wildPickedColor

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
    getNextPlayer(rotation = this.rotation, currentPlayer = this.currentPlayer) {
        // user input validation
        if (rotation != "CW" && rotation != "CCW") throw new Error("Invalid rotation. It must be CW or CCW")
        if (currentPlayer && !(currentPlayer instanceof Player)) throw new Error("CurrentPlayer must be an instance of Player")
        if (currentPlayer == null) return this.#getRandomFromArr(this.players)

        let index = this.players.indexOf(currentPlayer)
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

    toJSON() {
        return {
            config: this.config.toJSON(),
            playerNames: this.playerNames,
            rotation: this.rotation,
            currentPlayer: this.currentPlayer,
            state: this.state,
            discardedCards: this.discardedCards.toJSON(),
            decks: this.decks.map(d => d.toJSON()),
            players: this.players.map(p => p.toJSON()),
        }

    }


    /**
     * @param {Config} config only the override part of this is used
     */
    static fromJSON(json, config) {
        let invalidText = "Invalid JSON: {0}. You can only import a game that was exported or you did something wrong. with manual editing of the JSON."
        if (!json) throw new Error(invalidText.replace("{0}", "json is missing"))
        if (!(config instanceof Config)) throw new Error("config is missing")
        try {
            if (typeof json == 'string') json = JSON.parse(json)

        }
        catch (e) {
            throw new Error(invalidText.replace("{0}", "json is not parsable"))
        }
        // turn config class override into a class
        // validation


        if (!json.config) throw new Error(invalidText.replace("{0}", "config in json is missing"))
        if (!json.playerNames) throw new Error(invalidText.replace("{0}", "playerNames is missing"))
        if (!json.rotation) throw new Error(invalidText.replace("{0}", "rotation is missing"))
        if (typeof json.currentPlayer == 'undefined') throw new Error(invalidText.replace("{0}", "currentPlayer is missing"))
        if (!json.state) throw new Error(invalidText.replace("{0}", "state is missing"))
        if (!json.discardedCards) throw new Error(invalidText.replace("{0}", "discardedCards is missing"))
        if (!json.decks) throw new Error(invalidText.replace("{0}", "decks is missing"))
        if (!json.players) throw new Error(invalidText.replace("{0}", "players is missing"))

        // insertion
        config.insertValues(json.config)
        let game = new Game(json.playerNames, config)
        game.rotation = json.rotation
        // game.currentPlayer = Player.fromJSON(json.currentPlayer)
        game.players = json.players.map(p => Player.fromJSON(p))
        // @ts-ignore
        game.currentPlayer = game.getPlayerById(json.currentPlayer.id)
        game.state = json.state
        game.discardedCards = Deck.fromJSON(json.discardedCards)
        game.decks = json.decks.map(d => Deck.fromJSON(d))

        return game

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
     * @param {number} id
     */
    getPlayerById(id) {
        for (let player of this.players) {
            if (player.id == id) return player
        }
        return null
    }

    /**
     * @param {string} name
     */
    getPlayerByName(name) {
        for (let player of this.players) {
            if (player.name == name) return player
        }
        return null
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