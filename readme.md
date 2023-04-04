<div style="text-align: center; ">

<img alt="npm" src="https://img.shields.io/npm/dt/uno-game-engine">
<img alt="npm" src="https://img.shields.io/npm/dw/uno-game-engine">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/1Euro7Cent/uno-game-engine">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/1Euro7Cent/uno-game-engine">
<img alt="GitHub watchers" src="https://img.shields.io/github/watchers/1Euro7Cent/uno-game-engine">
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/1Euro7Cent/uno-game-engine">

</div>

# UNO Game Engine

## Installing

```
npm i uno-game-engine
```

## Basic Usage

```js

const { Game, events } = require('uno-game-engine')

let game = new Game(["player1", "player2", "player3", "player4"]) // this also accepts an actual player objects array. but you need to create it yourself

game.eventManager.addEvent(new events.PlayerChangeEvent((oldPlayer, newPlayer) => {
    // do something with it
    console.log(`It is now ${newPlayer.name}'s turn`)

}))

game.start()

// playing cards
let cardToPlay = game.currentPlayer.hand.getCard("RED", "FIVE") // assuming the current player has a red five in their hand

let success = game.play(game.currentPlayer, cardToPlay) // returns true if the card was played, false if it was not

//drawing cards. all functions below return true if they succeed

// draws one card for the current player
game.draw(game.currentPlayer)

// draws five cards for "player3"
game.draw(game.getPlayerByName("player3"), 5)
// draw three cards for player with id 2. (default starts at 0 and increments by 1)
game.draw(game.getPlayerById(2),3)
```

## Configs

```js
const { Game, Config } = require('uno-game-engine') 

let config = new Config()

config.setDefaultRotation("CW") // CCW (counter clock wise) or CW (clock wise)
    .setInitialCards(7) // how many cards each player starts with
    .setPlayersPerDeck(4) // how many players per deck of cards 
                          //(if more players are present, another deck (to draw from) will be created)

let game = new Game(["player1", "player2", "player3", "player4"], config)

// alternatively you can do this:
game = new Game(["player1", "player2", "..."], new Config().setInitialCards(7).setPlayersPerDeck(4))
```

## Events

```js
const { Game, events } = require('uno-game-engine')
let game = new Game(["Player 1", "Player 2"])

game.eventManager.addEvent(new events.PlayerPlayEvent((player, card) => {
    console.log(`${player} played ${card}`)
}))

game.eventManager.addEvent(new events.PlayerChangeEvent((oldPlayer, newPlayer) => {
    console.log(`It is now ${newPlayer}'s turn`)
}))

game.eventManager.addEvent(new events.PlayerDrawEvent((player, cards) => {
    console.log(`${player} drew ${cards.length} cards`)
}))

// manually fire an event

game.eventManager.fireEvent(events.PlayerChangeEvent.fire(game.currentPlayer, game.getNextPlayer()))

// making own events

let Event = events.Event // sadly you need this
class MyEvent extends Event {
    /**
     * i recommend doing this. but is it NOT required
     * @param {(something: number, somethingElse: string) => any} callback 
     * @param {boolean} once 
     */
    constructor(callback, once = false) {
        super(callback, "myEvent", once)
    }

    /**
     * i also recommend doing this
     * @param {number} something 
     * @param {string} somethingElse 
     * @returns 
     */
    static fire(something, somethingElse) {
        return new events.FireEvent("myEvent", something, somethingElse)
    }
}

// using own events

game.eventManager.addEvent(new MyEvent((something, somethingElse) => {
    // do something with it
    console.log(`something: ${something}, somethingElse: ${somethingElse}`)
}))

// fireing the event
game.eventManager.fireEvent(MyEvent.fire(1, "hello"))
```

# More coming soon
