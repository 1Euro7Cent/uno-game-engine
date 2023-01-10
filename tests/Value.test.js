const { expect, test } = require('@jest/globals')
const Value = require('../src/logic/cards/Value')
const values = require('../src/constants/values')

test('testing Color is working properly', () => {
    for (let value in values) {
        let valueInstance = new Value(value)
        expect(valueInstance.value).toBe(value)
    }


    // testing invalid colors
    // expect(() => new Value('invalid')).toThrow()
    // expect(() => new Value('')).toThrow()
    // expect(() => new Value('0')).toThrow()
    // expect(() => new Value('zeRo')).toThrow()
    // expect(() => new Value('THReE')).toThrow()


})