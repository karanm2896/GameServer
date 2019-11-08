var cardImport = require('./Card');

Hand=
{
    HighCard:0,
    OnePair:1,
    TwoPairs:2,
    ThreeKind:3,
    Straight:4,
    Flush:5,
    FullHouse:6,
    FourKind:7
};

class HandValue 
{
    constructor(){
        var total,highCard;
    }
         get Total(){
            return this.total;
         }
         
         set Total(value){
            this.total = value;
         } 
         
        get HighCard() 
        {
            return this.highCard;
        }
        
        set HighCard(value){
            this.highCard = value;
        } 
};

module.exports = HandValue;

 


module.exports = class HandEvaluator extends cardImport
    {
        constructor(sortedHand){
            super();
           var heartsSum;
           var diamondSum;
           var clubSum;
           var spadesSum;
           let cards;
           this.Cards = sortedHand;
           var handValue;
           var Total;
           var HighCard;
        }
      
        get Total(){
            return this.handValue.Total
        }

        get HighCard(){
            return this.handValue.HighCard;
        }

        set Cards(value){
            this.cards = [];
            for(let i=0;i<7;i++){
                this.cards[i] = value[i];
            }
            
        }

        get Cards(){
            return this.cards;
        }

       getNumberOfSuit()
        {
        this.heartsSum = 0;
        this.diamondSum = 0;
        this.clubSum = 0;
        this.spadesSum = 0;
            for(let i=0;i<7;i++){
                if (this.cards[i].MY_SUIT == this.GET_CARD.SUIT.H)
                    this.heartsSum++;
                else if (this.cards[i].MY_SUIT == this.GET_CARD.SUIT.D)
                    this.diamondSum++;
                else if (this.cards[i].MY_SUIT == this.GET_CARD.SUIT.C)
                    this.clubSum++;
                else if (this.cards[i].MY_SUITt == this.GET_CARD.SUIT.S)
                    this.spadesSum++;
            }
        }


    EvaluateHand()
    {
        this.handValue = new HandValue();
        //get the number of each suit on hand
        this.getNumberOfSuit();
    
        if (this.FourOfKind())
            return Hand.FourKind;
        else if (this.FullHouse())
            return Hand.FullHouse;
        else if (this.Flush())
            return Hand.Flush;
        else if (this.Straight())
            return Hand.Straight;
        else if (this.ThreeOfKind())
            return Hand.ThreeKind;
        else if (this.TwoPairs())
            return Hand.TwoPairs;
        else if (this.OnePair())
            return Hand.OnePair;

        //if the hand is nothing, than the player with highest card wins
        for (let i = 2; i < 7; i++)
        {
            this.handValue.Total += this.cards[i].MY_VALUE;// this.cards[i].MY_VALUE;
        }
        this.handValue.HighCard = this.cards[6].MY_VALUE;// cards[6].MY_VALUE;
        return Hand.HighCard;
    }

   

    FourOfKind()
    {
        //if the first 4 cards, add values of the four cards and last card is the highest
        //0,1,2,3,,,,4->high card
        if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[0].MY_VALUE == this.cards[2].MY_VALUE && this.cards[0].MY_VALUE == this.cards[3].MY_VALUE)
        {
            this.handValue.Total = this.cards[1].MY_VALUE * 4;
            this.handValue.HighCard = this.cards[4].MY_VALUE;
            return true;
        }
        ///1,2,3,4,,,,,5->high card
        else if (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE && this.cards[1].MY_VALUE == this.cards[3].MY_VALUE && this.cards[1].MY_VALUE == this.cards[4].MY_VALUE)
        {
            this.handValue.Total = this.cards[1].MY_VALUE * 4;
            this.handValue.HighCard = this.cards[0].MY_VALUE;
            return true;
        }
        ///2,3,4,5,,,,6->high card
        else if (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE && this.cards[2].MY_VALUE == this.cards[4].MY_VALUE && this.cards[2].MY_VALUE == this.cards[5].MY_VALUE)
        {
            this.handValue.Total = this.cards[2].MY_VALUE * 4;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        ///3,4,5,6,,,,2->high card
        else if (this.cards[3].MY_VALUE == this.cards[4].MY_VALUE && this.cards[3].MY_VALUE == this.cards[5].MY_VALUE && this.cards[3].MY_VALUE == this.cards[6].MY_VALUE)
        {
            this.handValue.Total = ards[3].MY_VALUE * 4;
            this.handValue.HighCard = this.cards[2].MY_VALUE;
            return true;
        }

        return false;
    }

    FullHouse()
    {
        //the first three cars and last two this.cards are of the same value
        //first two this.cards, and last three this.cards are of the same value
        if ((this.cards[2].MY_VALUE == this.cards[3].MY_VALUE && this.cards[2].MY_VALUE == this.cards[4].MY_VALUE && this.cards[5].MY_VALUE == this.cards[6].MY_VALUE) ||
                (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE && this.cards[4].MY_VALUE == this.cards[5].MY_VALUE && this.cards[4].MY_VALUE == this.cards[6].MY_VALUE))
        {
            this.handValue.Total = (this.cards[2].MY_VALUE) + (this.cards[3].MY_VALUE) + (this.cards[4].MY_VALUE) +
                (this.cards[5].MY_VALUE) + (this.cards[6].MY_VALUE);
            return true;
        }
        else if ((this.cards[1].MY_VALUE == this.cards[2].MY_VALUE && this.cards[1].MY_VALUE == this.cards[3].MY_VALUE && this.cards[4].MY_VALUE == this.cards[5].MY_VALUE) ||
            (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE && this.cards[3].MY_VALUE == this.cards[4].MY_VALUE && this.cards[3].MY_VALUE == this.cards[5].MY_VALUE))
        {
            this.handValue.Total = (this.cards[1].MY_VALUE) + (this.cards[2].MY_VALUE) + (this.cards[3].MY_VALUE) +
                (this.cards[4].MY_VALUE) + (this.cards[5].MY_VALUE);
            return true;
        }
        else if ((this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[0].MY_VALUE == this.cards[2].MY_VALUE && this.cards[3].MY_VALUE == this.cards[4].MY_VALUE) ||
            (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[2].MY_VALUE == this.cards[3].MY_VALUE && this.cards[2].MY_VALUE == this.cards[4].MY_VALUE))
        {
            this.handValue.Total = (this.cards[0].MY_VALUE) + (this.cards[1].MY_VALUE) + (this.cards[2].MY_VALUE) +
                (this.cards[3].MY_VALUE) + (this.cards[4].MY_VALUE);
            return true;
        }
        else if ((this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[0].MY_VALUE == this.cards[2].MY_VALUE && this.cards[5].MY_VALUE == this.cards[6].MY_VALUE) ||
           (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[4].MY_VALUE == this.cards[5].MY_VALUE && this.cards[4].MY_VALUE == this.cards[6].MY_VALUE))
        {
            this.handValue.Total = (this.cards[0].MY_VALUE) + (this.cards[1].MY_VALUE) + (this.cards[4].MY_VALUE) +
                (this.cards[5].MY_VALUE) + (this.cards[6].MY_VALUE);
            return true;
        }

        return false;
    }


    FlushHighCard(mySuit)
    {
        var highValue = 0;
        for (let i = 0; i < this.cards.Length; i++)
        {
            if (this.cards[i].MY_SUIT == mySuit)
            {
                this.handValue.Total += this.cards[i].MY_VALUE;

            }
            if (this.cards[i].MY_VALUE > highValue)
            {
                highValue = this.cards[i].MY_VALUE;
            }
        }
    }

    Flush()
    {
        //if all suits are the same
        //if flush, the player with higher this.cards win
        //whoever has the last card the highest, has automatically all the this.cards total higher
        if (this.heartsSum >= 5)
        {
            FlushHighCard(this.GET_CARD.SUIT.H);
            return true;
        }
        else if (this.diamondSum >= 5)
        {
            FlushHighCard(this.GET_CARD.SUIT.D);
            return true;
        }
        else if (this.clubSum >= 5)
        {
            FlushHighCard(this.GET_CARD.SUIT.C);
            return true;
        }
        else if (this.spadesSum >= 5)
        {
            FlushHighCard(this.GET_CARD.SUIT.S);
            return true;
        }
        return false;
    }


    Straight()
    {
        switch (this.OnePairForTwoPair())
        {
            case 5:
                if (this.cards[1].MY_VALUE + 1 == this.cards[2].MY_VALUE &&
                    this.cards[2].MY_VALUE + 1 == this.cards[3].MY_VALUE &&
                    this.cards[3].MY_VALUE + 1 == this.cards[4].MY_VALUE &&
                    this.cards[4].MY_VALUE + 1 == this.cards[5].MY_VALUE)
                {
                    //player with the highest value of the last card wins
                    this.handValue.Total = this.cards[5].MY_VALUE;
                    return true;
                }
                break;
            case 4:
                if (this.cards[0].MY_VALUE + 1 == this.cards[1].MY_VALUE &&
                        this.cards[1].MY_VALUE + 1 == this.cards[2].MY_VALUE &&
                        this.cards[2].MY_VALUE + 1 == this.cards[3].MY_VALUE &&
                        this.cards[3].MY_VALUE + 1 == this.cards[6].MY_VALUE)
                {
                    //player with the highest value of the last card wins
                    this.handValue.Total = this.cards[6].MY_VALUE;
                    return true;
                }
                break;
            case 3:
                if (this.cards[0].MY_VALUE + 1 == this.cards[1].MY_VALUE &&
                        this.cards[1].MY_VALUE + 1 == this.cards[2].MY_VALUE &&
                        this.cards[2].MY_VALUE + 1 == this.cards[3].MY_VALUE &&
                        this.cards[5].MY_VALUE + 1 == this.cards[6].MY_VALUE)
                {
                    //player with the highest value of the last card wins
                    this.handValue.Total = this.cards[6].MY_VALUE;
                    return true;
                }
                break;
            case 2:
                if (this.cards[0].MY_VALUE + 1 == this.cards[1].MY_VALUE &&
                        this.cards[1].MY_VALUE + 1 == this.cards[2].MY_VALUE &&
                        this.cards[4].MY_VALUE + 1 == this.cards[5].MY_VALUE &&
                        this.cards[5].MY_VALUE + 1 == this.cards[6].MY_VALUE)
                {
                    //player with the highest value of the last card wins
                    this.handValue.Total = this.cards[6].MY_VALUE;
                    return true;
                }
                break;
            default:
                for (let i = 0; i < 3; i++)
                {
                    if (this.cards[2 - i].MY_VALUE + 1 == this.cards[3 - i].MY_VALUE &&
                    this.cards[3 - i].MY_VALUE + 1 == this.cards[4 - i].MY_VALUE &&
                    this.cards[4 - i].MY_VALUE + 1 == this.cards[5 - i].MY_VALUE &&
                    this.cards[5 - i].MY_VALUE + 1 == this.cards[6 - i].MY_VALUE)
                    {
                        //player with the highest value of the last card wins
                        this.handValue.Total = this.cards[6].MY_VALUE;
                        return true;
                    }
                }

                break;
        }

        return false;
    }

    ThreeOfKind()
    {
        //if the 1,2,3 this.cards are the same OR
        //2,3,4 this.cards are the same OR
        //3,4,5 this.cards are the same
        //3rds card will always be a part of Three of A Kind
        if (this.cards[4].MY_VALUE == this.cards[5].MY_VALUE && this.cards[4].MY_VALUE == this.cards[6].MY_VALUE)
        {
            this.handValue.Total = this.cards[4].MY_VALUE * 3;
            this.handValue.HighCard = this.cards[3].MY_VALUE;
            return true;
        }
        else if (this.cards[3].MY_VALUE == this.cards[4].MY_VALUE && this.cards[3].MY_VALUE == this.cards[5].MY_VALUE)
        {
            this.handValue.Total = this.cards[4].MY_VALUE * 3;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if ((this.cards[1].MY_VALUE == this.cards[2].MY_VALUE && this.cards[1].MY_VALUE == this.cards[3].MY_VALUE) || (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE && this.cards[2].MY_VALUE == this.cards[4].MY_VALUE))
        {
            this.handValue.Total = this.cards[3].MY_VALUE * 3;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if ((this.cards[0].MY_VALUE == this.cards[1].MY_VALUE && this.cards[0].MY_VALUE == this.cards[2].MY_VALUE) ||
         (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE && this.cards[1].MY_VALUE == this.cards[3].MY_VALUE))
        {
            this.handValue.Total = this.cards[2].MY_VALUE * 3;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }

        return false;
    }

    TwoPairs()
    {
        //if 1,2 and 3,4
        //if 1.2 and 4,5
        //if 2.3 and 4,5
        //with two pairs, the 2nd card will always be a part of one pair 
        //and 4th card will always be a part of second pair

        if (this.OnePairForTwoPair() == 5)
        {
            if (this.cards[3].MY_VALUE == this.cards[4].MY_VALUE)
            {
                this.handValue.Total = (this.cards[3].MY_VALUE * 2) + (this.cards[5].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[2].MY_VALUE;
                return true;
            }

            else if (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE)
            {
                this.handValue.Total = (this.cards[2].MY_VALUE * 2) + (this.cards[5].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[4].MY_VALUE;
                return true;
            }

            else if (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE)
            {
                this.handValue.Total = (this.cards[1].MY_VALUE * 2) + (this.cards[5].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[4].MY_VALUE;
                return true;
            }
            else if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE)
            {
                this.handValue.Total = (this.cards[0].MY_VALUE * 2) + (this.cards[5].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[4].MY_VALUE;
                return true;
            }
        }
        else if (this.OnePairForTwoPair() == 4)
        {
            if (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE)
            {
                this.handValue.Total = (this.cards[2].MY_VALUE * 2) + (this.cards[4].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
            else if (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE)
            {
                this.handValue.Total = (this.cards[1].MY_VALUE * 2) + (this.cards[4].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
            else if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE)
            {
                this.handValue.Total = (this.cards[0].MY_VALUE * 2) + (this.cards[4].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
        }
        else if (this.OnePairForTwoPair() == 3)
        {
            if (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE)
            {
                this.handValue.Total = (this.cards[1].MY_VALUE * 2) + (this.cards[3].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
            else if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE)
            {
                this.handValue.Total = (this.cards[0].MY_VALUE * 2) + (this.cards[3].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
        }
        else if (this.OnePairForTwoPair() == 2)
        {
            if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE)
            {
                this.handValue.Total = (this.cards[0].MY_VALUE * 2) + (this.cards[2].MY_VALUE * 2);
                this.handValue.HighCard = this.cards[6].MY_VALUE;
                return true;
            }
        }

        return false;
    }


    OnePair()
    {
        //if 1,2 -> 5th card has the highest value
        //2.3
        //3,4
        //4,5 -> card #3 has the highest value
        var totalvalue = 0;
       
        if (this.cards[5].MY_VALUE == this.cards[6].MY_VALUE)
        {
            this.handValue.Total = this.cards[5].MY_VALUE * 2 + this.cards[4].MY_VALUE;
            this.handValue.HighCard = this.cards[4].MY_VALUE;
            return true;
        }
        else if (this.cards[4].MY_VALUE == this.cards[5].MY_VALUE)
        {
            this.handValue.Total = this.cards[4].MY_VALUE * 2 + this.cards[6].MY_VALUE;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if (this.cards[3].MY_VALUE == this.cards[4].MY_VALUE)
        {
            this.handValue.Total = this.cards[3].MY_VALUE * 2 + this.cards[6].MY_VALUE;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE)
        {
            this.handValue.Total = this.cards[2].MY_VALUE * 2 + this.cards[6].MY_VALUE;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if (this.cards[1].MY_VALUE == this.cards[2].MY_VALUE)
        {
            this.handValue.Total = this.cards[1].MY_VALUE * 2 + this.cards[6].MY_VALUE;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }
        else if (this.cards[0].MY_VALUE == this.cards[1].MY_VALUE)
        {
            this.handValue.Total = this.cards[0].MY_VALUE * 2 + this.cards[6].MY_VALUE;
            this.handValue.HighCard = this.cards[6].MY_VALUE;
            return true;
        }






        return false;
    }

    OnePairForTwoPair()
    {
        //if 1,2 -> 5th card has the highest value
        //2.3
        //3,4
        //4,5 -> card #3 has the highest value
        if (this.cards[5].MY_VALUE == this.cards[6].MY_VALUE)
        {
            return 5;
        }
        else if (this.cards[4].MY_VALUE == this.cards[5].MY_VALUE)
        {

            return 4;
        }
        else if (this.cards[3].MY_VALUE == this.cards[4].MY_VALUE)
        {

            return 3;
        }
        else if (this.cards[2].MY_VALUE == this.cards[3].MY_VALUE)
        {

            return 2;
        }

        return -1;
    };

}
