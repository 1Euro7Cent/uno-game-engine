const { expect, test } = require('@jest/globals')
const Game = require('../src/logic/Game')
const Config = require('../src/Config')
const Card = require('../src/logic/cards/Card')
const Deck = require('../src/logic/cards/Deck')
const Player = require('../src/logic/players/Player')
const colors = require('../src/constants/colors')
const values = require('../src/constants/values')

test('testing Game is working properly', () => {
    let game = new Game()
    expect(game.players.length).toBe(0)
    expect(game.decks.length).toBe(0)
    expect(game.config).toBeInstanceOf(Config)

    game = new Game([
        new Player("player1", 0),
        new Player("player2", 1),
    ], new Config().setInitialCards(5).setPlayersPerDeck(10))

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
    expect(game.getPlayerByName("player1")).toBeInstanceOf(Player)
    expect(game.getPlayerByName("player1").name).toBe("player1")
    expect(game.getPlayerByName("asd")).toBe(null)


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

    // play card mechanics
    let playableCards = game.currentPlayer.getPlayableCards(game.discardedCards.getTopCard(), true)
    if (playableCards.length > 0) {
        // console.log("playable cards: " + playableCards.length)
        // console.log("trying to play: " + playableCards[0])
        // console.log("top card: " + game.discardedCards.getTopCard())
        let res = game.play(game.currentPlayer, playableCards[0])
        expect(res).toBe(true)
    }
    else {
        // player should draw a card
        let res = game.draw(game.currentPlayer)
        expect(res).toBe(true)
    }

    // draw card mechanics (#getDeck)

    let drawGame = new Game(["player1", "player2"], new Config().setInitialCards(50))

    drawGame.start()
    expect(drawGame.decks.length).toBe(1)
    expect(drawGame.currentPlayer.hand.cards.length).toBe(50)
    expect(drawGame.decks[0].cards.length).toBe(
        108 // total cards in deck
        - (2 * 50) // two players each with 50 cards
        - 1) // discard pile

    // console.log("cur len", drawGame.players)

    // put 10 cards in discard pile from current player
    for (let i = 0; i < 10; i++) {

        let card = drawGame.currentPlayer.hand.getTopCard(true)

        drawGame.discardedCards.addCard(card)
    }

    expect(drawGame.currentPlayer.hand.cards.length).toBe(50 - 10)
    expect(drawGame.discardedCards.cards.length).toBe(11)

    // draw 20 cards from deck


    // console.log("cur len", drawGame.currentPlayer.hand.cards.length)
    expect(drawGame.draw(drawGame.currentPlayer, 20, false, true, true)).toBe(true)
    // console.log("cur len", drawGame.currentPlayer.hand.cards.length)
    expect(drawGame.currentPlayer.hand.cards.length).toBe(60)
    expect(drawGame.decks[0].cards.length).toBe(108 - 10 + 7)




    //#gameLogic

    for (let player of game.players) {
        for (let color of [colors.BLUE, colors.GREEN, colors.RED, colors.YELLOW]) {

            player.hand.addCard(new Card(color, values.REVERSE))
            player.hand.addCard(new Card(color, values.SKIP))
            player.hand.addCard(new Card(color, values.DRAW_TWO))
            player.hand.addCard(new Card(color, values.WILD_DRAW_FOUR))

        }
    }

    let prevRot = game.rotation
    let prevPlayer = game.currentPlayer
    let shouldNextPlayer = game.getNextPlayer(game.rotation == "CCW" ? "CW" : "CCW")

    // reverse
    game.discardedCards.addCard(new Card(colors.BLUE, values.FIVE))
    expect(game.play(
        game.currentPlayer,
        // @ts-ignore
        game.currentPlayer.hand.getCard(
            game.discardedCards.getTopCard().color,
            values.REVERSE))
    ).toBe(true)
    expect(game.rotation).not.toBe(prevRot)
    expect(game.currentPlayer).not.toBe(prevPlayer)
    expect(game.currentPlayer).toBe(shouldNextPlayer)

    // skip
    prevRot = game.rotation
    prevPlayer = game.currentPlayer
    shouldNextPlayer = game.getNextPlayer(game.rotation, game.getNextPlayer())
    game.discardedCards.addCard(new Card(colors.BLUE, values.FIVE))
    expect(game.play(
        game.currentPlayer,
        // @ts-ignore
        game.currentPlayer.hand.getCard(
            game.discardedCards.getTopCard().color,
            values.SKIP))
    ).toBe(true)
    expect(game.rotation).toBe(prevRot)
    expect(game.currentPlayer).not.toBe(prevPlayer)
    expect(game.currentPlayer).toBe(shouldNextPlayer)

    // draw two
    prevRot = game.rotation
    prevPlayer = game.currentPlayer
    shouldNextPlayer = game.getNextPlayer(game.rotation, game.getNextPlayer())
    game.discardedCards.addCard(new Card(colors.BLUE, values.FIVE))
    expect(game.play(
        game.currentPlayer,
        // @ts-ignore
        game.currentPlayer.hand.getCard(
            game.discardedCards.getTopCard().color,
            values.DRAW_TWO))
    ).toBe(true)
    expect(game.rotation).toBe(prevRot)
    expect(game.currentPlayer).not.toBe(prevPlayer)
    expect(game.currentPlayer).toBe(shouldNextPlayer)

    // wild draw four
    prevRot = game.rotation
    prevPlayer = game.currentPlayer
    shouldNextPlayer = game.getNextPlayer(game.rotation, game.getNextPlayer())
    game.discardedCards.addCard(new Card(colors.BLUE, values.FIVE))
    // expect(game.play(
    //     game.currentPlayer,
    //     // @ts-ignore
    //     game.currentPlayer.hand.getCard(
    //         game.discardedCards.getTopCard().color,
    //         values.WILD_DRAW_FOUR))
    // ).toBe(true)

    // expect(game.rotation).toBe(prevRot)
    // expect(game.currentPlayer).not.toBe(prevPlayer)
    // expect(game.currentPlayer).toBe(shouldNextPlayer) // todo: re add this




})