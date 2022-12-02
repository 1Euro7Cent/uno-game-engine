const { expect, test } = require('@jest/globals')
const cardCountConstants = require('../src/constants/cardCounts')

test('testing if total card count is corrent', () => {
    let totalCardCount = 0
    for (const color in cardCountConstants) {
        for (const value in cardCountConstants[color]) {
            totalCardCount += cardCountConstants[color][value]
        }
    }
    expect(totalCardCount).toBe(108)
})