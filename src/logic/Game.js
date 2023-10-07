const { deprecate } = require('node:util')
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
     * @param {string[] | Player[]} players 
     * @param {Config} config 
     */
    constructor(players = [], config = new Config()) {

        if (!Array.isArray(players)) throw new Error("Players must be an array")

        // type checks for players
        for (let player of players) {
            if (typeof player === "string") {
                continue
            }

            if (!(player instanceof Player)) {
                throw new Error("Players must be an array of strings or players")
            }
        }


        if (!(config instanceof Config)) throw new Error("Config must be an instance of Config")



        this.config = config



        let ovrClasses = this.config.override.classes
        // actually overriding the classes

        // @ts-ignore
        Deck = ovrClasses.Deck || Deck
        // @ts-ignore
        Player = ovrClasses.Player || Player


        this.initPlayers = players

        /** @type {"CW" | "CCW"}*/
        this.rotation = config.defaultRotation

        /**@type {Player}*/
        // @ts-ignore
        this.currentPlayer = null

        /**@type {"NOT_STARTED" | "PLAYING" | "STACK_DRAW" | "CONTEST"} */
        this.state = "NOT_STARTED"

        /**
         * this shows the amount of cards that should be drawn at the end of the stack draw
         */
        this.stackDrawAmount = 0

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
     * @deprecated since version 3.2.0. use {@link Game.players} or {@link Game.initPlayers} instead. note that initPlayers is basically the same that you passed in the constructor
     * @returns {string[]} the names of the players
     */
    get playerNames() {
        return deprecate(() => {
            if (this.players.length > 0)
                return this.players?.map(player => player.name)

            return this.initPlayers.map(player => player instanceof Player ? player.name : player)

        }, "playerNames (Game#playerNames) is deprecated. Use Game#players or Game#initPlayers instead.")()
    }

    set playerNames(value) {
        deprecate(() => {
            this.initPlayers = value
        }, "playerNames (Game#playerNames) is deprecated. Use Game#players or Game#initPlayers instead.")()
    }


    /**
     * this starts the game and initializes all the players and decks
     */
    start() {
        if (this.initPlayers.length < 2) throw new Error("Not enough players")
        if (this.state != "NOT_STARTED") throw new Error("Game already started")
        // decks

        let decks = Math.ceil(this.initPlayers.length / this.config.playersPerDeck) // 5 players / 4 players per deck = 2 decks

        for (let i = 0; i < decks; i++) {
            this.decks.push(new Deck().insertDefaultCards())
        }

        // players

        for (let i in this.initPlayers) {
            let player = this.initPlayers[i]

            if (typeof player === "string") {
                player = new Player(player, parseInt(i))
            }


            this.draw(player, this.config.initialCards, false, true, true, true)
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
     * @param {boolean} force if true ignores check if the player is the current player
     * @returns {boolean} if the draw was successful
     */
    draw(player, cards = 1, isNext = true, silent = false, nextSilent = false, force = false) {
        // user input validation
        if (!player) throw new Error("No player provided")
        if (!(player instanceof Player)) throw new Error("Player must be an instance of Player")

        if (typeof cards != "number") throw new Error("Cards must be a number")
        if (cards < 1) throw new Error("Cards must be greater than 0")
        if (!Number.isInteger(cards)) throw new Error("Cards must be an integer")
        if (!force && player != this.currentPlayer) return false

        let deck = this.#getDeck()
        let drawnCards = []

        if (this.state == "STACK_DRAW") {
            cards = this.stackDrawAmount
            this.stackDrawAmount = 0
            this.state = "PLAYING"
        }

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

        return drawnCards.length == cards

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
            if (this.players.length == 2) {
                this.setNextPlayer(true)
            }
            return true
        }

        // skip 
        if (card.value.value == values.SKIP) {
            this.setNextPlayer(true)
            return true
        }

        // draw 2 
        if (card.value.value == values.DRAW_TWO) {

            // console.log("draw 2 laid")
            // console.log(this.config.stackCards, card.value.value == values.DRAW_TWO, this.getNextPlayer().hand.getCard(undefined, values.DRAW_TWO) !== null, this.state)
            // console.log(this.state)
            if (this.config.stackCards &&
                card.value.value == values.DRAW_TWO &&
                this.getNextPlayer().hand.getCard(undefined, values.DRAW_TWO) !== null
            ) {
                this.stackDrawAmount += 2
                this.state = "STACK_DRAW"
                // console.log("stacking draw 2", this.state)
            }
            else {

                // console.log(this.state, this.stackDrawAmount)
                if (this.state == "STACK_DRAW") {
                    this.stackDrawAmount += 2
                    // console.log(`giving ${this.stackDrawAmount} stacked cards`)
                    let drawRes = this.draw(this.getNextPlayer(), this.stackDrawAmount, true, false, true, true)

                    this.stackDrawAmount = 0
                    this.state = "PLAYING"
                }

                else {
                    this.draw(this.getNextPlayer(), 2, true, false, true, true)
                    // console.log("drawing 2")
                }
            }
            return true
        }

        // draw 4
        if (card.value.value == values.WILD_DRAW_FOUR) {

            if (this.config.stackCards &&
                card.value.value == values.WILD_DRAW_FOUR &&
                this.getNextPlayer().hand.getCard(undefined, values.WILD_DRAW_FOUR) !== null
            ) {
                this.stackDrawAmount += 4
                this.state = "STACK_DRAW"
            }
            else {

                if (this.state == "STACK_DRAW") {
                    this.stackDrawAmount += 4
                    this.draw(this.getNextPlayer(), this.stackDrawAmount, true, false, true, true)
                    this.stackDrawAmount = 0
                    this.state = "PLAYING"
                }
                else {

                    this.draw(this.getNextPlayer(), 4, true, false, true, true)
                }
            }


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
            card.isValidOn(this.discardedCards.getTopCard(), true, this.config.stackCards && this.state == "STACK_DRAW")) {

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
            initPlayers: this.initPlayers.map(p => {
                if (p instanceof Player) return p.toJSON()
                else return p
            }),
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
        if (!json.initPlayers) throw new Error(invalidText.replace("{0}", "initPlayers is missing"))
        if (!json.rotation) throw new Error(invalidText.replace("{0}", "rotation is missing"))
        if (typeof json.currentPlayer == 'undefined') throw new Error(invalidText.replace("{0}", "currentPlayer is missing"))
        if (!json.state) throw new Error(invalidText.replace("{0}", "state is missing"))
        if (!json.discardedCards) throw new Error(invalidText.replace("{0}", "discardedCards is missing"))
        if (!json.decks) throw new Error(invalidText.replace("{0}", "decks is missing"))
        if (!json.players) throw new Error(invalidText.replace("{0}", "players is missing"))

        // insertion
        config.insertValues(json.config)
        let game = new Game(json.initPlayers, config)
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


        if (deck.cards.length == 0) {
            let newDeck = new Deck()
            let topCard = this.discardedCards.getTopCard(false)

            for (let card of this.discardedCards.cards) {
                if (card == topCard) continue
                newDeck.addCard(card)
                this.discardedCards.removeCard(card)
            }

            if (newDeck.cards.length == 0) {
                newDeck.insertDefaultCards()
            }

            newDeck.shuffle()
            this.decks.push(newDeck)
            deck = newDeck

        }

        // remove all empty decks
        this.decks = this.decks.filter(d => d.cards.length > 0)

        return deck
    }

    /**
     * @param {any[]} arr
     */
    #getRandomFromArr(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
}