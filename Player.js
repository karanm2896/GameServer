var shortid = require('shortid');
//var card = require('./GameScripts/Card');

 

 

class Player{
    constructor(){
        this.playerName='';
        this.id=shortid.generate();
        this.playerCardSuit = [];
        this.playerCardValue = []; 
        this.betPoints = 0;
        this.chips = 1000;
        this.isCardFold = false;
        this.isAllin = false;
        this.totalBetPoints = 0;
    }

    get Player_id(){
        return this.id;
    }

    set Player_Card_suit(value){
        this.playerCardSuit.push(value);
    }
    get Player_Card_suit(){
        return this.playerCardSuit;
    }

    set Player_Card_value(value){
        this.playerCardValue.push(value);
    }
    get Player_Card_value(){
        return this.playerCardValue;
    }
}

module.exports = Player;