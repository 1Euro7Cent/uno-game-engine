const Game = require('./src/logic/Game')
const Config = require('./src/Config')
const Card = require('./src/logic/cards/Card')
const Deck = require('./src/logic/cards/Deck')
const Color = require('./src/logic/cards/Color')
const Value = require('./src/logic/cards/Value')
const Player = require('./src/logic/players/Player')

const Event = require('./src/events/Event')
const EventManager = require('./src/events/EventManager')
const PlayerPlayEvent = require('./src/events/PlayerPlayEvent')
const PlayerDrawEvent = require('./src/events/PlayerDrawEvent')
const PlayerChangeEvent = require('./src/events/PlayerChangeEvent')

const cardCounts = require('./src/constants/cardCounts')
const colors = require('./src/constants/colors')
const events = require('./src/constants/events')
const values = require('./src/constants/values')
const FireEvent = require('./src/events/FireEvent')

module.exports = {
    Game,
    Config,
    Card,
    Deck,
    Color,
    Value,
    Player,
    constants: {
        cardCounts,
        colors,
        events,
        values
    },
    events: {
        FireEvent,
        EventManager,
        Event,
        PlayerPlayEvent,
        PlayerDrawEvent,
        PlayerChangeEvent

    }

}