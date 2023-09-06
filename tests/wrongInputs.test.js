// @ts-nocheck

const { expect, test } = require('@jest/globals')
const Config = require('../src/Config')
const Game = require('../src/logic/Game')
const Player = require('../src/logic/players/Player')


test('Creating and starting game', () => {

    let game = new Game()

    expect(() => new Game("asdf")).toThrow("Players must be an array")
    expect(() => new Game([1, 2, 3, 4])).toThrow("Players must be an array of strings")
    expect(() => new Game([], "asdf")).toThrow("Config must be an instance of Config")

    expect(() => game.start()).toThrow("Not enough player")
    game.initPlayers = ["Player 1", "Player 2", "Player 3", "Player 4"]

    game.start()

    expect(() => game.start()).toThrow("Game already started")
})

test('Drawing cards', () => {
    let game = new Game(["Player 1", "Player 2", "Player 3", "Player 4"])
    game.start()


    // player
    expect(() => game.draw()).toThrow("No player provided")
    expect(() => game.draw("aasdasd")).toThrow("Player must be an instance of Player")
    expect(game.draw(game.getNextPlayer())).toBeFalsy() // trying to draw where the player given is not the current player

    // amount
    expect(() => game.draw(game.players[0], true)).toThrow("Cards must be a number")
    expect(() => game.draw(game.players[0], 0)).toThrow("Cards must be greater than 0")
    expect(() => game.draw(game.players[0], -1)).toThrow("Cards must be greater than 0")
    expect(() => game.draw(game.players[0], 1.5)).toThrow("Cards must be an integer")

})

test('Playing cards', () => {

    let game = new Game(["Player 1", "Player 2", "Player 3", "Player 4"])
    game.start()


    // player
    expect(() => game.play()).toThrow("No player provided")
    expect(() => game.play("aasdasd")).toThrow("Player must be an instance of Player")

    // card
    expect(() => game.play(game.players[0])).toThrow("No card provided")
    expect(() => game.play(game.players[0], "aasdasd")).toThrow("Card must be an instance of Card")

})

test('getNextPlayer', () => {
    let game = new Game(["Player 1", "Player 2", "Player 3", "Player 4"])
    game.start()

    expect(() => game.getNextPlayer("asd")).toThrow("Invalid rotation. It must be CW or CCW")
    expect(() => game.getNextPlayer("CW", "asd")).toThrow("CurrentPlayer must be an instance of Player")
})

test('fromJson', () => {
    let invalidText = "Invalid JSON: {0}. You can only import a game that was exported or you did something wrong. with manual editing of the JSON."

    let config = new Config()

    expect(() => Game.fromJSON()).toThrow(invalidText.replace("{0}", "json is missing"))
    expect(() => Game.fromJSON("a")).toThrow("config is missing")
    expect(() => Game.fromJSON("a", config)).toThrow("json is not parsable")

    expect(() => Game.fromJSON({}, config)).toThrow("config in json is missing")
    expect(() => Game.fromJSON({ config: {} }, config)).toThrow(invalidText.replace("{0}", "initPlayers is missing"))
    expect(() => Game.fromJSON({
        config: {},
        initPlayers: []
    }, config)).toThrow(invalidText.replace("{0}", "rotation is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW"
    }, config)).toThrow(invalidText.replace("{0}", "currentPlayer is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW",
        currentPlayer: 0
    }, config)).toThrow(invalidText.replace("{0}", "state is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW",
        currentPlayer: 0,
        state: "started"
    }, config)).toThrow(invalidText.replace("{0}", "discardedCards is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW",
        currentPlayer: 0,
        state: "started",
        discardedCards: []
    }, config)).toThrow(invalidText.replace("{0}", "decks is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW",
        currentPlayer: 0,
        state: "started",
        discardedCards: [],
        decks: []
    }, config)).toThrow(invalidText.replace("{0}", "players is missing"))

    expect(() => Game.fromJSON({
        config: {},
        initPlayers: [],
        rotation: "CW",
        currentPlayer: 0,
        state: "started",
        discardedCards: [],
        decks: [],
        players: []
    }, config)).not.toThrow()

})
