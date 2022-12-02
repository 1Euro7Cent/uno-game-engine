module.exports = class FireEvent {
    constructor(name, ...args) {
        this.name = name
        this.args = args
    }
}