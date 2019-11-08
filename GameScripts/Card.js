
let CARD ={
SUIT:{
    H:0,
    S:1,
    D:2,
    C:3
},
VALUE:{
    
                TWO: 2,
                THREE: 3,
                FOUR: 4,
                FIVE: 5,
                SIX: 6,
                SEVEN: 7,
                EIGHT: 8,
                NINE: 9,
                TEN: 10,
                JACK: 11,
                QUEEN: 12,
                KING: 13,
                ACE: 14

}
};


class Card{
    constructor(){
        var SUIT='';
        var VALUE=0;
    }

     get GET_CARD(){
        return CARD;
    }

    set MY_SUIT(VALUE){
        this.SUIT=VALUE;
    }
    set MY_VALUE(VALUE){
        this.VALUE=VALUE;
    }

    get MY_SUIT(){
        return this.SUIT;
    }

    get MY_VALUE(){
        return this.VALUE;
    }

    
}
  

module.exports = Card;