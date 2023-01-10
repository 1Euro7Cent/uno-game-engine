const { expect, test } = require('@jest/globals')
const colors = require('../src/constants/colors')
const values = require('../src/constants/values')
const Card = require('../src/logic/cards/Card')
const Color = require('../src/logic/cards/Color')
const Value = require('../src/logic/cards/Value')

test('testing if Card is working properly', () => {

    let card1 = new Card(new Color(colors.RED), new Value(values.ZERO))
    let card2 = new Card(new Color(colors.RED), new Value(values.ZERO))

    expect(card1.isValidOn(card2)).toBe(true)
    expect(card1.isValidOn(card2, true)).toBe(true)

    card1 = new Card(new Color(colors.BLACK), new Value(values.WILD))
    card2 = new Card(new Color(colors.RED), new Value(values.ZERO))

    expect(card1.isValidOn(card2)).toBe(true)
    expect(card1.isValidOn(card2, true)).toBe(false)

    card1 = new Card(new Color(colors.BLUE), new Value(values.SEVEN))
    card2 = new Card(new Color(colors.YELLOW), new Value(values.SEVEN))

    expect(card1.isValidOn(card2)).toBe(true)
    expect(card1.isValidOn(card2, true)).toBe(true)

    card2 = new Card(new Color(colors.YELLOW), new Value(values.EIGHT))

    expect(card1.isValidOn(card2)).toBe(false)
    expect(card1.isValidOn(card2, true)).toBe(false)
})