var NUM_OF_CARDS = 52;
let cardClass = require('./Card');
var cardclassobj = new cardClass(); 

var deck=[NUM_OF_CARDS];
for (let index = 0; index < NUM_OF_CARDS; index++) {
    deck[index] = new cardClass();
}

module.exports = class DeckOfCards{
    
     setUpDeck()
    {
        var i = 0;
        for (let s in cardclassobj.GET_CARD.SUIT)
        {
            for (let v in cardclassobj.GET_CARD.VALUE)
            {
                deck[i].MY_SUIT=s;
                deck[i].MY_VALUE=cardclassobj.GET_CARD.VALUE[v];
                i++;
            }
        }

        this.ShuffleCards();
        //this.DisplayCards();
    }

 ShuffleCards(){
     var temp;
    for (let shuffleTimes = 0; shuffleTimes < 150; shuffleTimes++)
    {
        for (let i = 0; i < NUM_OF_CARDS; i++)
        {
            //swap the cards
            var secondCardIndex = Math.floor((Math.random() * 14) + 1);
            temp = deck[i];
            deck[i] = deck[secondCardIndex];
            deck[secondCardIndex] = temp;
            //SEND THIS secondCardIndex TO UNITY
        }
    }
    }
    
DisplayCards(){
    for (let index = 0; index < NUM_OF_CARDS; index++) {
        console.log(deck[index].MY_VALUE + ''+deck[index].MY_SUIT);
        
    }
}
};




module.exports.deck=deck;

// module.exports.setUpDeck=setUpDeck;
// module.exports.deck=deck;
 



