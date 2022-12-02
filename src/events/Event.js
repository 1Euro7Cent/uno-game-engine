const FireEvent = require("./FireEvent")

module.exports = class BaseEvent {
    #called = false

    /**
     * 
     * @param {function} callback 
     * @param {string} name 
     * @param {boolean} once 
     */
    constructor(callback, name, once = false) {
        this.callback = callback
        this.name = name
        this.once = once
    }

    call(...args) {
        if (this.#called && this.once) return
        this.#called = true
        this.callback(...args)

    }
}