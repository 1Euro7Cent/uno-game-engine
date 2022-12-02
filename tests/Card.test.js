const { expect, test } = require('@jest/globals')
const colors = require('../src/constants/colors')
const values = require('../src/constants/values')
const Card = require('../src/logic/cards/Card')
const Color = require('../src/logic/cards/Color')
const Value = require('../src/logic/cards/Value')

test('testing if Card is working properly', () => {
    let card1 = new Card(colors.RED, values.ONE)
    let card2 = new Card(colors.RED, values.FIVE)

    expect(card1.isValidOn(card2)).toBe(true)

    card1 = new Card(colors.YELLOW, values.SEVEN)

    expect(card1.isValidOn(card2)).toBe(false)

    card1 = new Card(colors.BLACK, values.WILD)

    expect(card1.isValidOn(card2)).toBe(true)

    card2 = new Card(colors.BLACK, values.WILD)

    expect(card1.isValidOn(card2)).toBe(true)

    card2 = new Card(colors.BLUE, values.REVERSE)

    expect(card1.isValidOn(card2)).toBe(true)

    card1 = new Card(colors.RED, values.DRAW_TWO)

    expect(card1.isValidOn(card2)).toBe(false)


    card1 = new Card(colors.GREEN, values.TWO)
    card2 = new Card(colors.YELLOW, values.TWO)

    expect(card1.isValidOn(card2)).toBe(true)

    expect(new Card(new Color(colors.BLUE), new Value(values.DRAW_TWO))).toBeInstanceOf(Card)
})