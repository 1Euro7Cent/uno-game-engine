const { expect, test } = require('@jest/globals')
const Color = require('../src/logic/cards/Color')
const colors = require('../src/constants/colors')

test('testing Color is working properly', () => {
    for (let color in colors) {
        let colorInstance = new Color(color)
        expect(colorInstance.color).toBe(color)
    }

    // testing invalid colors
    // expect(() => new Color('invalid')).toThrow()
    // expect(() => new Color('')).toThrow()
    // expect(() => new Color('rED')).toThrow()
    // expect(() => new Color('red ')).toThrow()

})