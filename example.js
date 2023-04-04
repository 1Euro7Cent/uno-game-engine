
const { Game, events, constants, Card, Player, Config } = require('./index.js')
const readLine = require('readline')
const fs = require('fs')
const { fstat } = require('fs')

class ComputerPlayer extends Player {
    constructor(name, id) {
        super(name, id)
        console.log("Computer player created")
    }
}


let config = new Config()
// @ts-ignore
config.override.classes.Player = ComputerPlayer

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {

    let name = await askUser("What is your name? ")
    let game = new Game([name, "Computer"], config) /*
    let game = Game.fromJSON(JSON.parse(fs.readFileSync("game.json", "utf-8")), config) //*/

    game.eventManager.addEvent(new events.PlayerPlayEvent((player, card) => {
        console.log(`${player.name} played ${card}`)

    }))

    game.eventManager.addEvent(new events.PlayerChangeEvent((oldPlayer, newPlayer) => {
        console.log(`It is now ${newPlayer.name}'s turn`)
        computerPlay()

    }))

    game.eventManager.addEvent(new events.PlayerDrawEvent((player, card) => {
        if (player.name == "Computer") console.log(`${player.name} drew ${card.length} cards`)
        if (player.name == name) console.log(`${player.name} drew ${card}`)
    }))

    function computerPlay() {
        if (game.currentPlayer.name == "Computer") {
            let playableCards = game.currentPlayer.getPlayableCards(game.discardedCards.getTopCard())
            if (playableCards.length > 0) {

                let playableWilds = playableCards.filter(card => card.wild)
                let playableNonWilds = playableCards.filter(card => !card.wild)
                if (playableNonWilds.length > 0) playableCards = playableNonWilds
                else playableCards = playableWilds

                let playedCard = playableCards[Math.floor(Math.random() * playableCards.length)]
                if (playedCard.wild) {
                    let colors = game.currentPlayer.hand.getColorCounts()
                    let largestColor = Object.keys(colors).reduce((a, b) => colors[a] > colors[b] ? a : b)
                    playedCard.wildPickedColor = constants.colors[largestColor]
                }

                let played = game.play(game.currentPlayer, playedCard)

                if (!played) {
                    console.log(`Computer tried to play ${playedCard} on ${game.discardedCards.getTopCard()} but it was not valid`)
                    computerPlay()
                }
            }
            else {
                game.draw(game.currentPlayer)
            }
        }
        else {
            userPlay()
        }

    }

    async function userPlay() {
        console.log()
        console.log()
        if (game.currentPlayer.name == name) {

            console.log("Opponents cards:")

            for (let player of game.players) {
                if (player.name != name) {
                    console.log(`   ${player.name}: ${player.hand.cards.length} cards`)
                }
            }


            console.log()
            console.log("Discarded cards:", game.discardedCards.getTopCard().toString())

            console.log("Your hand:")
            console.log(game.currentPlayer.hand.cards.join(", "))

            let counts = game.currentPlayer.hand.getColorCounts()

            // console.log("Your hand counts:")
            for (let color in counts) {
                console.log(`   ${color}: ${counts[color]}`)
            }


            console.log("Your playable cards:")

            console.log(game.currentPlayer.getPlayableCards(game.discardedCards.getTopCard()).join(", "))

            let response = await askUser("What card do you want to play? ")
            if (response == "d") {
                game.draw(game.currentPlayer)
            }
            else {

                response = response
                    .replace(/wd4/g, "WILD_DRAW_FOUR")
                    .replace(/d2/g, "DRAW_TWO")
                    .replace(/r/g, "RED")
                    .replace(/g/g, "GREEN")
                    .replace(/b/g, "BLUE")
                    .replace(/y/g, "YELLOW")
                    .replace(/w/g, "WILD")
                    .replace(/s/g, "SKIP")
                    .replace(/r/g, "REVERSE")
                    .replace(/0/g, "ZERO")
                    .replace(/1/g, "ONE")
                    .replace(/2/g, "TWO")
                    .replace(/3/g, "THREE")
                    .replace(/4/g, "FOUR")
                    .replace(/5/g, "FIVE")
                    .replace(/6/g, "SIX")
                    .replace(/7/g, "SEVEN")
                    .replace(/8/g, "EIGHT")
                    .replace(/9/g, "NINE")


                let [...args] = response.toUpperCase().split(" ")
                let card = game.currentPlayer.hand.getCard(args[0], args[1])

                if (card) {
                    let played = game.play(game.currentPlayer, card)

                    if (!played) {
                        console.log("could not play card")
                        userPlay()
                    }
                }
                else {
                    console.log("Invalid card")
                    userPlay()
                }
            }


        }
        else {
            computerPlay()
        }





    }

    try {
        game.start()
        console.log(game.playerNames) // since 3.2.0 it should output a deprecated warning
    } catch (e) {
        console.log(e)
    }
    // fs.writeFileSync("game.json", JSON.stringify(game.toJSON(), null, 4))

    /*
    let player = game.players.find(p => p.name == name)
    for (let i = 0; i < 7; i++) {
        player?.hand.addCard(new Card(constants.colors.BLACK, constants.values.WILD))
    }

    //*/
    computerPlay()

})()




/**
 * @param {string} question
 * @returns {Promise<string>}
 */
async function askUser(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (response) => {
            resolve(response)
        })
    })
}

