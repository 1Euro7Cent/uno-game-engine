const { expect, test } = require('@jest/globals')

test('testing if the basic language is working', () => {
    expect(1 + 2).toBe(3)
    expect(1 + 2).not.toBe(4)

    expect(true).toBeTruthy()
})