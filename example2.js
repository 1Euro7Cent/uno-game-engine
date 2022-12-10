const b = "something"

class A {
    constructor() {
        this.b = "something"
    }
    toString() {
        return this.b
    }
}
let a = new A()
if (a == b) {
    console.log("it is true")
}
else {
    console.log("it is false")
}