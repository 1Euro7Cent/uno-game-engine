const { expect, test } = require('@jest/globals')
const Config = require('../src/Config')
const Card = require('../src/logic/cards/Card')
const Deck = require('../src/logic/cards/Deck')
const Game = require('../src/logic/Game')
const Player = require('../src/logic/players/Player')


let saved = ""


test('Saving and loading', () => {
    let config = new Config()
        .setDefaultRotation("CCW")
        .setInitialCards(10)

    let game = new Game(["Player 1", "Player 2", "Player 3", "Player 4"], config)
    game.start()

    game.discardedCards.addCard(new Card("red", "1"))


    let json = game.toJSON()
    saved = JSON.stringify(json) // to simulate saving to a file


    let loaded = JSON.parse(saved) // to simulate loading from a file
    let game2 = Game.fromJSON(loaded, config)



    expect(game2.players.length).toBe(4)
    expect(game2.decks.length).toBe(1)
    expect(game2.currentPlayer).toBeInstanceOf(Player)
    expect(game2.config).toBeInstanceOf(Config)
    expect(game2.rotation).toBe("CCW")
    expect(game2.discardedCards).toBeInstanceOf(Deck)
    expect(game2.discardedCards.cards.length).toBe(2)

    // players inventory (hand)
    for (let player of game2.players) {
        expect(player.hand.cards.length).toBe(10)
    }
})
