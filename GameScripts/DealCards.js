var deckofcards = require('./DeckOfCards');
var HandEvaluator = require('./HandEvaluator');
var P = require('../index');

var PlayersHand = [];
var sortedPlayersHand = [];

var highestHandindex;
var winnerIndexes = [];

module.exports = class DealCards extends deckofcards{

    constructor(noofPlayers){
        super();
        this.PlayerCount = noofPlayers;
        for (let i = 0; i < this.PlayerCount; i++) {
            PlayersHand[i]=[];
            sortedPlayersHand[i]=[];
            
        }
        // module.exports = PlayersHand;
        // module.exports = sortedPlayersHand;
    }

    get P_Hand(){
        return PlayersHand;
    }

    Deal(){
        this.setUpDeck();
        this.getHandsNew();
        this.sortCardsNew();
        //this.evaluate();
    }

getHandsNew(){
    var countpoint = 0;
    
    console.log('-------2 Cards to Each Player-------');
    for (let i = 0; i < this.PlayerCount; i++) ///Dealing 2 Cards to each Player
    {
        for (let j = 0; j < 2; j++)
        {
            PlayersHand[i][j] = deckofcards.deck[j+countpoint]; //   getDeck[j + countpoint];
            console.log(PlayersHand[i][j].VALUE +'' + PlayersHand[i][j].SUIT+' ');
        }
        
       countpoint+=2;

    }
    console.log('-------7 Cards to Each Player-------');
    for (let i = 0; i < this.PlayerCount; i++)
        {
            for (let k = countpoint; k < countpoint + 5; k++) ///making 7 Cards pack for each player
            {
                PlayersHand[i][k - countpoint + 2] = deckofcards.deck[k];
                //console.log(PlayersHand[i][k - countpoint + 2].VALUE+''+PlayersHand[i][k - countpoint + 2].SUIT+' ');
            }
        }

        for (let i = 0; i < this.PlayerCount; i++){
            for (let j = 0; j < 7; j++){
                console.log(PlayersHand[i][j].VALUE+''+PlayersHand[i][j].SUIT+' ');
            }
            console.log('');
        }
}
   sortCardsNew(){
    let tempArr=[]; 
       for (let i = 0; i < this.PlayerCount; i++) {
        for (let j=0;j<7;j++){
            tempArr[j]=PlayersHand[i][j];
        }   
        tempArr.sort(function (a, b) {
            return a.VALUE - b.VALUE;
          });

        for (let j=0;j<7;j++){
            sortedPlayersHand[i][j]=tempArr[j];
        }   

        //console.log(tempArr);
        tempArr=[];
     
       }
   }


    evaluate(){
        var allplayerHandEvaluator=[];
        var playersEvaluatedHand = [];

        //allplayerHandEvaluator =[];
        for(let i=0;i<this.PlayerCount;i++){
            allplayerHandEvaluator.push(new HandEvaluator(sortedPlayersHand[i]));
        }

        for(let i=0;i<this.PlayerCount;i++){
            playersEvaluatedHand[i] = allplayerHandEvaluator[i].EvaluateHand();
        }
        
        highestHandindex = 0;
        var carCheck=false;
        var highestHand = 0;
        var isPotSplit = false;
        var splitPotWinner = new Array(5); //int[gameManager.initialPlayerCount];
        var k = 0;

        winnerIndexes = P.player_Blind;

        playersEvaluatedHand.sort()
        console.log(playersEvaluatedHand);

        for (let i = 0; i < this.PlayerCount; i++)
        {
            var carCheck = winnerIndexes[i].isCardFold;
            if (carCheck)
                continue;

            if (playersEvaluatedHand[i] > highestHand)
            {
                highestHand = playersEvaluatedHand[i];
                highestHandindex = i;
            }
        }

        for (let i = 0; i < this.PlayerCount; i++)
        {
            var carCheck = winnerIndexes[i].isCardFold;
            if (carCheck)
                continue;

            if (playersEvaluatedHand[i] == highestHand && i == highestHandindex)
            {
                continue;
            }
            else if (playersEvaluatedHand[i] == highestHand)
            {
                if (allplayerHandEvaluator[i].Total > allplayerHandEvaluator[highestHandindex].Total)
                {
                    isPotSplit = false;
                    highestHand = playersEvaluatedHand[i];
                    highestHandindex = i;
                }
                else if (allplayerHandEvaluator[i].Total == allplayerHandEvaluator[highestHandindex].Total)
                {
                    if (allplayerHandEvaluator[i].HighCard > allplayerHandEvaluator[highestHandindex].HighCard)
                    {
                        isPotSplit = false;
                        highestHand = playersEvaluatedHand[i];
                        highestHandindex = i;
                    }
                    else if (allplayerHandEvaluator[i].HighCard == allplayerHandEvaluator[highestHandindex].HighCard)
                    {
                        isPotSplit = true;
                        splitPotWinner[k] = i;
                        console.log('Draw Hand---Split Pot');
                        k++;
                    }

                }

            }

        }

        var str='';
        var p_winners = new Array(5);
        
        module.exports.highestHandindex = highestHandindex+1;
        if (isPotSplit)
        {
            splitPotWinner[k + 1] = highestHandindex;
           
            for (let i = 0; i < k+2; i++)
            {
                str += p_winners[i] + " & ";
            }
        }
        else
        {
            str = "Winner Player " + (highestHandindex+1);
            console.log(str);
        }
    }

    Newevaluate(PotDistribution){

        var allplayerHandEvaluator=[];
        var playersEvaluatedHand = [];

        var pot_Distribution = [];
        pot_Distribution = PotDistribution;

        console.log(pot_Distribution);

        //allplayerHandEvaluator =[];
        for(let i=0;i<pot_Distribution.length;i++){
            allplayerHandEvaluator.push(new HandEvaluator(sortedPlayersHand[PotDistribution[i]]));
        }

        for(let i=0;i<pot_Distribution.length;i++){
            playersEvaluatedHand[i] = allplayerHandEvaluator[i].EvaluateHand();
        }
        
        highestHandindex = 0;
        var carCheck=false;
        var highestHand = 0;
        var isPotSplit = false;
        var splitPotWinner = new Array(5); //int[gameManager.initialPlayerCount];
        var k = 0;

        winnerIndexes = P.player_Blind;

        playersEvaluatedHand.sort()
        console.log(playersEvaluatedHand);

        for (let i = 0; i < pot_Distribution.length; i++)
        {
            var carCheck = winnerIndexes[i].isCardFold;
            if (carCheck)
                continue;

            if (playersEvaluatedHand[i] > highestHand)
            {
                highestHand = playersEvaluatedHand[i];
                highestHandindex = i;
            }
        }

        for (let i = 0; i < pot_Distribution.length; i++)
        {
            var carCheck = winnerIndexes[i].isCardFold;
            if (carCheck)
                continue;

            if (playersEvaluatedHand[i] == highestHand && i == highestHandindex)
            {
                continue;
            }
            else if (playersEvaluatedHand[i] == highestHand)
            {
                if (allplayerHandEvaluator[i].Total > allplayerHandEvaluator[highestHandindex].Total)
                {
                    isPotSplit = false;
                    highestHand = playersEvaluatedHand[i];
                    highestHandindex = i;
                }
                else if (allplayerHandEvaluator[i].Total == allplayerHandEvaluator[highestHandindex].Total)
                {
                    if (allplayerHandEvaluator[i].HighCard > allplayerHandEvaluator[highestHandindex].HighCard)
                    {
                        isPotSplit = false;
                        highestHand = playersEvaluatedHand[i];
                        highestHandindex = i;
                    }
                    else if (allplayerHandEvaluator[i].HighCard == allplayerHandEvaluator[highestHandindex].HighCard)
                    {
                        isPotSplit = true;
                        splitPotWinner[k] = i;
                        console.log('Draw Hand---Split Pot');
                        k++;
                    }

                }

            }

        }

        var str='';
        var p_winners = new Array(5);
        
        module.exports.highestHandindex = highestHandindex+1;
        if (isPotSplit)
        {
            splitPotWinner[k + 1] = highestHandindex;
           
            for (let i = 0; i < k+2; i++)
            {
                str += p_winners[i] + " & ";
            }
        }
        else
        {
            str = "Winner Player " + (highestHandindex+1);
            console.log(str);
        }

    }//SidepotEvaluate
}



