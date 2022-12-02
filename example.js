
const { Game, events } = require('./index.js')
const readLine = require('readline')


const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {

    let name = await askUser("What is your name? ")
    let game = new Game([name, "Computer"])

    game.eventManager.addEvent(new events.PlayerPlayEvent((player, card) => {
        console.log(`${player.name} played ${card}`)

    }))

    game.eventManager.addEvent(new events.PlayerChangeEvent((oldPlayer, newPlayer) => {
        console.log(`It is now ${newPlayer.name}'s turn`)
        computerPlay()

    }))

    game.eventManager.addEvent(new events.PlayerDrawEvent((player, card) => {
        console.log(`${player.name} drew ${card}`)
    }))

    function computerPlay() {
        if (game.currentPlayer.name == "Computer") {
            let playableCards = game.currentPlayer.getPlayableCards(game.discardedCards.getTopCard())
            if (playableCards.length > 0) {
                let playedCard = playableCards[Math.floor(Math.random() * playableCards.length)]

                let played = game.play(game.currentPlayer, playedCard)

                if (!played) {
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

            console.log("Your playable cards:")
            console.log(game.currentPlayer.getPlayableCards(game.discardedCards.getTopCard()).join(", "))
            console.log()

            let response = await askUser("What card do you want to play? ")
            if (response == "d") {
                game.draw(game.currentPlayer)
            }
            else {
                let card = game.currentPlayer.hand.cards.find(c => c.toString().toLowerCase() == response)

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

    game.start()
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

