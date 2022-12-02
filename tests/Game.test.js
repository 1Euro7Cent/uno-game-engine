const { expect, test } = require('@jest/globals')
const Game = require('../src/logic/Game')
const Config = require('../src/Config')
const Card = require('../src/logic/cards/Card')
const Deck = require('../src/logic/cards/Deck')
const Player = require('../src/logic/players/Player')

test('testing Game is working properly', () => {
    let game = new Game()
    expect(game.players.length).toBe(0)
    expect(game.decks.length).toBe(0)
    expect(game.config).toBeInstanceOf(Config)

    game = new Game(["player1", "player2"], new Config().setInitialCards(5).setPlayersPerDeck(10))

    expect(game.players.length).toBe(0)
    expect(game.decks.length).toBe(0)
    expect(game.config).toBeInstanceOf(Config)
    expect(game.rotation).toBe("CW")
    expect(game.currentPlayer).toBe(null)
    expect(game.discardedCards).toBeInstanceOf(Deck)
    expect(game.discardedCards.cards.length).toBe(0)

    game.start()
    expect(game.players.length).toBe(2)
    expect(game.decks.length).toBe(1)
    expect(game.currentPlayer).toBeInstanceOf(Player)


    // players inventory (hand)

    let player1 = game.players[0]
    let player2 = game.players[1]

    expect(player1.hand.cards.length).toBe(5)
    expect(player2.hand.cards.length).toBe(5)

    game = new Game(["player1", "player2", "player3", "player4", "player5", "player6", "player7", "player8", "player9", "player10",]
        , new Config().setInitialCards(20).setPlayersPerDeck(5).setDefaultRotation("CCW"))

    expect(game.players.length).toBe(0)
    expect(game.decks.length).toBe(0)
    expect(game.config).toBeInstanceOf(Config)
    expect(game.rotation).toBe("CCW")
    expect(game.currentPlayer).toBe(null)
    expect(game.discardedCards).toBeInstanceOf(Deck)
    expect(game.discardedCards.cards.length).toBe(0)



    game.start()
    expect(game.players.length).toBe(10)
    expect(game.decks.length).toBe(2)
    expect(game.currentPlayer).toBeInstanceOf(Player)

    // players inventory (hand)

    for (let player of game.players) {
        expect(player.hand.cards.length).toBe(20)


        for (let card of player.hand.cards) {
            expect(card).toBeInstanceOf(Card)
        }
    }

    // next player mechanics

    game.currentPlayer = null
    game.setNextPlayer()
    expect(game.currentPlayer).toBeInstanceOf(Player)

    let nextPlayer = game.getNextPlayer()
    expect(nextPlayer).not.toBe(game.currentPlayer)
    expect(nextPlayer).toBeInstanceOf(Player)

    // rotational next player mechanics

    for (let i = 0; i < 4; i++) {

        game.flipDirection()

        for (let p = 0; p < game.players.length + 4; p++) {


            // @ts-ignore
            let index = game.players.indexOf(game.currentPlayer)

            if (game.rotation == "CW") {
                index++
                if (index >= game.players.length) index = 0
            }
            else {
                index--
                if (index < 0) index = game.players.length - 1
            }

            let expectedNextPlayer = game.players[index]
            let nextPlayer = game.getNextPlayer()



            nextPlayer = game.getNextPlayer()
            expect(nextPlayer).not.toBe(game.currentPlayer)
            expect(nextPlayer).toBeInstanceOf(Player)
            expect(nextPlayer).toBe(expectedNextPlayer)

            game.currentPlayer = nextPlayer
        }
    }



})