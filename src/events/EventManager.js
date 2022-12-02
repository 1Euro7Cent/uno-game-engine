const events = require('../constants/events')
const BaseEvent = require('./Event')
const FireEvent = require('./FireEvent')

module.exports = class EventManager {
    constructor() {

        /**
         * @type {BaseEvent[]}
         */
        this.events = []
    }

    /**
    * @param {BaseEvent} event
    * @returns {BaseEvent}
    */
    addEvent(event) {
        this.events.push(event)
        return event
    }

    /**
     * @param {FireEvent} fireEvent
     */
    fireEvent(fireEvent) {
        for (let event of this.events) {
            if (event.name === fireEvent.name) {
                event.call(...fireEvent.args)
            }

        }
    }

}