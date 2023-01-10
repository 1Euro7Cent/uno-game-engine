const { expect, test } = require('@jest/globals')
const Deck = require('../src/logic/cards/Deck')

test('testing Deck is working properly', () => {
    let deck = new Deck().insertDefaultCards()
    expect(deck.cards.length).toBe(108)

    let expectTopCard = deck.cards[0]
    let topCard = deck.getTopCard()
    expect(topCard).toEqual(expectTopCard)
    expect(deck.cards.length).toBe(108)


    let topCard2 = deck.getTopCard(true)
    expect(topCard2).toBe(expectTopCard)
    expect(deck.cards.length).toBe(107)
    expect(deck.cards[0]).not.toBe(expectTopCard)
})