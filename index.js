module.exports = function (portnum){

var io = require('socket.io')(process.env.PORT || portnum);
var dealCardsCLASS = require('./GameScripts/DealCards');
//var deckofcards = require('./GameScripts/DeckOfCards');

var Player = require('./Player');

var players = [];
var sockets = [];
var thisPlayerID;
console.log('Server Has Started');
var dealCardsOBJ;

var noOfplayers = 2;
//var initialPlayerCount = noOfplayers;
//var tempRaisedIndex = noOfplayers;
//var thisPlayer;// = new Player();
var current_turn = 0;
var timeOut;
var _turn = 0;
var roundNumber = 0;
//var totalPlayer = 0;
const MAX_WAITING = 1000;
var counter = 0;
//var currentIndex = 0;
var dealer = 0;
var isGameCompleted = false, isRoundCompleted = false;
var startIndex = 0;
var smallBlindBid = 25, bigBlindBid = 50;
var smallBlind = 0, bigBlind = 0;
var player_Blind = [], sortPlayer_blindChips = [];
var player;
var boardCards = [];
//var noOfplayers = 2;
var count = 0;
var totalBid = 0, tempBetValue = 0, currentRaiseValue = 0, callValue = 0;
var timer = 60;
var isCheck = false, isCall = false, isfirstTime = false, isfirstTimeDealer = false;
var allPot = []; var PotDistribution = [], indexforPot = 0;
var isAllInSet = false, roundPots = [0, 0, 0, 0];
var currentTempIndex = 0, isAllIn = false;
//-------------------------------------------//
var lowestAmountPlayer = 10000, lastRemovedPlayerAmount = 0, foldCount = 0;
var tempPlayers = [];
//var playersDisconnected = [];
var waitingPlayers = [];
var waitingSockets = [];
var isGameRunning = false;
// allpot -- values // potDistribution -- index of player for each pot array of array 
// indexforpot -- To add values to potDistribution

function next_turn() {

    console.log("Current Raise Value  " + currentRaiseValue + "temp bet values " + tempBetValue);

    if (player_Blind[_turn].isCardFold == false) {
        ResetTurn();
        console.log('--------------total biddd' + totalBid);
        assignCallValue();
    }
   
    if (player_Blind[_turn].isCardFold == true || (player_Blind[_turn].chips == 0)) {

        if (_turn != 0)
            currentTempIndex = _turn - 1;
        else
            currentTempIndex = player_Blind.length - 1;
        ResetTurn();
        MoveTurnonFold();

    }

    console.log(_turn);

    if (_turn == player_Blind.length)
        _turn = 0;

    io.sockets.emit('your_turn', { cp: _turn, addvalue: totalBid });
    checkTotalChips();
}//next_turn

function MoveTurnonFold() {
    while (player_Blind[_turn].isCardFold == true || player_Blind[_turn].chips == 0) {
        console.log("compare index " + currentTempIndex + "  " + _turn);
        _turn++;

        if (_turn == player_Blind.length)
            _turn = 0;

        console.log("check index " + currentTempIndex + "  " + _turn);
        if (currentTempIndex == _turn) {
            io.sockets.emit("deactivatebuttons");
            while (roundNumber <= 4) {
                roundNumber++;
                io.emit('RoundFINISH', { roundNo: roundNumber });
                checkLastRound(roundNumber, sockets[_turn]);
            }
            console.log("all other players are either fold or all - in ");
        }
        else {
            console.log("Game continue");
        }
    }
}//MoveTurnonFold

function ResetTurn() {
    sockets[_turn].emit('deactivatebuttons');
    console.log(currentTempIndex + " Temp index set");
    _turn++;
    if (_turn == player_Blind.length)
        _turn = 0;


}//ResetTurn

function JsonConvertor(data, valuname) {
    var jsonObject = JSON.stringify(data);
    var jObje = JSON.parse(jsonObject);
    return jObje[valuname];
}//JsonConvertor

function assignCallValue() {
        if (player_Blind[_turn].betPoints > 0)
        callValue = Math.abs(currentRaiseValue - player_Blind[_turn].betPoints);
    else {
        if (isRoundCompleted == true) {
            isRoundCompleted = false;
            tempBetValue = 0;
            callValue = 0;
        }
        else {
            callValue = currentRaiseValue;
        }

    }
   
    console.log(player_Blind[_turn].betPoints + " Call value is   " + callValue);
}//assignCallValue

function checkTotalChips() {

    if (callValue > player_Blind[_turn].chips) {
        io.sockets.emit('AssignCallValue', { cv: player_Blind[_turn].chips });
    }
    else {
        io.sockets.emit('AssignCallValue', { cv: callValue });
    }
}//checkTotalChips

function assignSmallBigBlindAndCurrentPlyer() {
    dealer = GetNextValidPlayerIndex(dealer);
    smallBlind = GetNextValidPlayerIndex(dealer);
    bigBlind = GetNextValidPlayerIndex(smallBlind);
    startIndex = GetNextValidPlayerIndex(bigBlind);

    if (dealer == smallBlind) {
        let error = "Minimum two player required";
        io.sockets.emit("totalBid", { tb: error });
        console.log("Minimum two player required");
    }
    
    _turn = startIndex;
   
    player_Blind[smallBlind].chips -= smallBlindBid;
    player_Blind[smallBlind].totalBetPoints = smallBlindBid;
   
    player_Blind[bigBlind].chips -= bigBlindBid;
    player_Blind[bigBlind].totalBetPoints = bigBlindBid;
    player_Blind[smallBlind].betPoints = smallBlindBid;
    player_Blind[bigBlind].betPoints = bigBlindBid;
    currentRaiseValue = bigBlindBid;
    assignCallValue();
    io.sockets.emit("InIt", { sb: smallBlind, bb: bigBlind, si: startIndex });
    for (let i = 0; i < player_Blind.length; i++) {
        io.sockets.emit("AssignTotalValues", { tc: player_Blind[i].chips, tp: player_Blind.length });
        
    }
    totalBid = smallBlindBid + bigBlindBid;
    isCall = true;
    isCheck = false;
    io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });
    io.sockets.emit("setPlayerBetPoints", { sbbp: smallBlindBid, bbbp: bigBlindBid, cv: callValue });
    io.sockets.emit("RemoveSmallbigBlindAmount", { sbb: player_Blind[smallBlind].chips, bbb: player_Blind[bigBlind].chips, totalPot: totalBid });


    counter++;
}//assignSmallBigBlindAndCurrentPlyer

function GetNextValidPlayerIndex(index) {
    let nextIndex = index + 1;
    nextIndex = nextIndex >= player_Blind.length ? 0 : nextIndex;
    while (player_Blind[nextIndex].chips == 0) {
        nextIndex++;
    }

    return nextIndex;
}//GetNextValidPlayerIndex



function checkAllIn() {
    if (player_Blind[_turn].chips <= 0) {
        player_Blind[_turn].isAllIn = true;
        isAllIn = true;
        isAllInSet = true;
        console.log("chck all in true  " + player_Blind[_turn].chips + ' ---------------- ' + tempBetValue);
    }
}//checkAllIn

function CalculateAllIn() {

    tempPlayers = new Array(player_Blind.length);
    tempPlayers = player_Blind.slice();
    tempPlayers = Array.from(player_Blind);
    console.log(isAllInSet + ' true or fals');
    if (isAllInSet) {
        let potValues = 0, lastLowestAmount = 0, totalPotPlayers = 0;
        sortPlayer_blindChips = [];
        console.log(tempPlayers[0].totalBetPoints + " 0 bet poitns");
        
        for (let i = 0; i < tempPlayers.length; i++) {
            if (!tempPlayers[i].isCardFold && tempPlayers[i].totalBetPoints > 0) {

                console.log(i + ' after push side pot index' + indexforPot);
                PotDistribution[indexforPot].push(i);
                console.log(tempPlayers[i].totalBetPoints + "    curernt bet pooints   ");
                if (tempPlayers[i].totalBetPoints < lowestAmountPlayer) {
                    console.log(tempPlayers[i].totalBetPoints + 'assing this value to lowest player amount');
                    lowestAmountPlayer = tempPlayers[i].totalBetPoints;
                    console.log(lowestAmountPlayer + "lowest amount is ");
                }
                else {
                    console.log(lowestAmountPlayer + "lowest amount playes value is high");
                }
            }
       
        }
        let tempPot = (lowestAmountPlayer - lastRemovedPlayerAmount) * (tempPlayers.length - foldCount);
        console.log('temp pot is  ' + tempPot + ' -- toatal bid ' + totalBid);

        if (foldCount > 0) {
            let diff = Math.abs(totalBid - tempPot);
            allPot.push(tempPot + diff);
        }
        else {
            allPot.push(tempPot);
        }

        console.log("final pot values is   " + allPot[0]);
        lastRemovedPlayerAmount = lowestAmountPlayer;

        //Remove all lowest value players
        let playersToRemove = [];

        for (let i = 0; i < tempPlayers.length; i++) {
            console.log(tempPlayers[i].totalBetPoints + '-----' + lowestAmountPlayer)
            if (tempPlayers[i].totalBetPoints == lowestAmountPlayer && !tempPlayers[i].isCardFold) {
                playersToRemove.push(i);
                console.log('please add this valuye to removed index    ' + i);
                tempPlayers[i].totalBetPoints -= lowestAmountPlayer;
            }
            else if (tempPlayers[i].totalBetPoints >= lowestAmountPlayer && !tempPlayers[i].isCardFold) {
                console.log('remaining players idnex  otherthan All-in   ' + i);
                tempPlayers[i].totalBetPoints -= lowestAmountPlayer;
            }
        }

        console.log(playersToRemove.length + " remove this playersy " + lowestAmountPlayer);

        for (var i = playersToRemove.length - 1; i >= 0; i--) {
            tempPlayers.splice(playersToRemove[i], 1);
        }

        console.log(allPot[0] + "pot valeus and Players left in temp array " + tempPlayers.length);
        indexforPot++;
        PotDistribution[indexforPot] = [];

       
        console.log(" side pot values");
       
        isAllInSet = false;
    }
    else {
        console.log(roundNumber + " Round");
        if (roundNumber == 4) {
            let temptotalbid = 0;
            let foldIndex = [];
           
            for (let i = 0; i < tempPlayers.length; i++) {
                if (!tempPlayers[i].isCardFold && tempPlayers[i].totalBetPoints > 0) {

                    if (PotDistribution[i] == null || PotDistribution[i].length == 0)
                        PotDistribution[i] = [];

                    PotDistribution[indexforPot].push(i);
                    temptotalbid += tempPlayers[i].totalBetPoints;
                }
               
            }
            console.log("i dont know temp total bid   " + temptotalbid + " --- " + PotDistribution[0]);
            if (foldCount > 0) {
                let diff = Math.abs(totalBid - temptotalbid);
                allPot.push(temptotalbid + diff);
            }
            else {
                allPot.push(temptotalbid);
            }
            console.log(allPot + ' why two times');
          
            indexforPot++;

        }
    }
}//CalculateAllIn

function checkLastRound(roundNumber, socket) {
  
    console.log("check last or not " + counter + " Rounde" + roundNumber + "  -------" + count);
    if (roundNumber == 4) {
        counter = 0;
        currentRaiseValue = 0;
        count = noOfplayers;
        for (let i = 0; i < noOfplayers; i++) {
            if (player_Blind[i].chips == 0) {
                count--;
            }
        }
        console.log('count players on ROund finish ' + count);
       
        isCall = false;
        isCheck = true;
        io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });

        for (let j = 0; j < player_Blind.length; j++) {
            roundPots[roundNumber] += player_Blind[j].betPoints;
            player_Blind[j].betPoints = 0;
        }
        for (let i = 0; i < allPot.length; i++) {
            console.log(allPot.length + " length " + PotDistribution[i].length + "  " + PotDistribution[i]);
            dealCardsOBJ.Newevaluate(PotDistribution[i]);
            var winn = dealCardsCLASS.highestHandindex;
            console.log('Highest Index ' + winn);
            player_Blind[PotDistribution[i][winn - 1]].chips += allPot[i];
            console.log(player_Blind[PotDistribution[i][winn - 1]].chips + " added amount");
            io.sockets.emit("WinGame", { winner: PotDistribution[i][winn], addvalue: player_Blind[winn - 1].chips });
        }

      
        for (let i = 0; i < allPot.length; i++) {
            console.log(allPot[i] + " pot devided between this index " + PotDistribution[i]);
        }
        isGameCompleted = true;
        roundNumber = 0;
        console.log('waiting players -------------'+Object.keys(waitingPlayers).length);
        if(Object.keys(waitingPlayers).length > 0){

            for(var p in waitingPlayers){
                player_Blind.push(waitingPlayers[p]);
                players[p] = waitingPlayers[p];
                //socket.emit('register', { id: p });
                noOfplayers++;
            }
           
        }
        waitingPlayers = [];

        count = noOfplayers;

        

        for (let i = 0; i < noOfplayers; i++) {
            if (player_Blind[i].chips == 0) {
                count--;
            }
        }
        console.log('count players ' + count);


        for (var p_id in players) {
            players[p_id].isCardFold = false;
        }
        io.sockets.emit('NewRound');
        StartGame(socket);
        console.log('-----Game Completed------');
    }
    if (isGameCompleted == false) {
        next_turn();
    }
}//checkLastRound

function CheckandCallNextTurn(socket) {
    counter++;
    isGameCompleted = false;
    if (player_Blind[_turn].isCardFold == false) {
        totalBid += tempBetValue;
        console.log('--------------total biddd' + totalBid);
    }
    io.sockets.emit("totalBid", { tb: totalBid });
    console.log("check round finished or not " + counter + " " + count);
    if (counter == noOfplayers) {

              // ---------- Round Completed --------------- //
        counter = 0;
        currentRaiseValue = 0;

        isCall = false;
        isCheck = true;
        io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });

        for (let j = 0; j < player_Blind.length; j++) {
            roundPots[roundNumber] += player_Blind[j].betPoints;
            player_Blind[j].betPoints = 0;
        }
        console.log(roundNumber + "round pots valeus " + roundPots[roundNumber]);
        roundNumber += 1;
        CalculateAllIn();
        if (roundNumber == 4) {

            //  if (isAllIn == true) {
            console.log(allPot.length + '    pots length');
            for (let i = 0; i < allPot.length; i++) {
                console.log(allPot.length + " length " + PotDistribution[i].length + "  " + PotDistribution[i]);
                dealCardsOBJ.Newevaluate(PotDistribution[i]);
                var winn = dealCardsCLASS.highestHandindex;
                console.log('Pot Destribution Highest Index ' + winn);
                // player_Blind[winn - 1].chips += allPot[i];
                player_Blind[PotDistribution[i][winn - 1]].chips += allPot[i];
                console.log(player_Blind[PotDistribution[i][winn - 1]].chips + " added CheckandCallNextTurn amount");
                io.sockets.emit("WinGame", { winner: PotDistribution[i][winn], addvalue: player_Blind[winn - 1].chips });
            }
          
            for (let i = 0; i < allPot.length; i++) {
                console.log(allPot[i] + " pot devided between this index " + PotDistribution[i]);
            }
            indexforPot = 0;
            isGameCompleted = true;
            roundNumber = 0;
            foldCount = 0;
            
            
            console.log('waiting players -------------'+Object.keys(waitingPlayers).length);
            if(Object.keys(waitingPlayers).length > 0){

                for(var p in waitingPlayers){
                    player_Blind.push(waitingPlayers[p]);
                    players[p] = waitingPlayers[p];
                    noOfplayers++;
                }
               
            }
            waitingPlayers = [];
            waitingSockets = [];
            console.log("waiting players dict --------" + waitingPlayers);
            count = noOfplayers;
            console.log("count====="+count + "  noofplayer====" +noOfplayers);

            for (let m = 0; m < player_Blind.length; m++) {
                player_Blind[m].totalBetPoints = 0;
            }

            PotDistribution[0].length = 0;
            allPot.length = 0;
            for (var p_id in players) {
                players[p_id].isCardFold = false;
            }
            io.sockets.emit('NewRound');
           
            console.log('-----Game Completed------');
            
            StartGame(socket);
        }
        //count = noOfplayers;
        for (let i = 0; i < noOfplayers; i++) {
            if (player_Blind[i].chips == 0 || player_Blind[i].isCardFold == true) {
                count--;
            }
        }
        console.log(counter + " COunter Total player " + count);
        
    }
    io.sockets.emit('RoundFINISH', { roundNo: roundNumber });
    
    if (isGameCompleted == false) {
        next_turn(socket);
    }


}//CheckandCallNextTurn

function StartGame(socket) {
    dealCardsOBJ = new dealCardsCLASS(noOfplayers);
    dealCardsOBJ.Deal();
    //PotDistribution[0] = [0, 1, 2, 3, 4];
    //allPot[0] = 150;
    allPot.length = 0;
    PotDistribution[0] = [];
    console.log("pot dis " + PotDistribution[0]);
    var i = 0;
    for (var p_id in players) {

        if (players[p_id].Player_Card_suit.length > 0) {
            players[p_id].Player_Card_suit.length = 0;
            players[p_id].Player_Card_value.length = 0;
        }
        for (let j = 0; j < 2; j++) {

            players[p_id].Player_Card_suit = dealCardsOBJ.P_Hand[i][j].SUIT;
            players[p_id].Player_Card_value = dealCardsOBJ.P_Hand[i][j].VALUE;
        }
        i++;
    }

    if (boardCards.length > 0) {
        boardCards.length = 0;
    }
    for (let j = 2; j < 7; j++) {
        boardCards.push(dealCardsOBJ.P_Hand[0][j].VALUE + dealCardsOBJ.P_Hand[0][j].SUIT);
    }

    assignSmallBigBlindAndCurrentPlyer();
    sockets[_turn].emit('activatebuttons');
    sockets[_turn].broadcast.emit('deactivatebuttons');

    console.log(players);

    io.sockets.emit('BoardCards', { boardCARDS: boardCards });
    
    //socket.broadcast.emit('BoardCards', { boardCARDS: boardCards });

    socket.emit('p_count', { pcount: count });
    socket.broadcast.emit('p_count', { pcount: count });

    for (var p_id in players) {
        socket.emit('MyCards', { players1: players[p_id] });
        socket.broadcast.emit('MyCards', { players1: players[p_id] });
        io.emit('RoundFINISH', { roundNo: roundNumber });
        if (p_id != thisPlayerID) {
            socket.emit('MyCards', { players1: players[p_id] });
        }
    }
}//StartGame

function WaitingPlayerinLobby(){
    //console.log(typeof waitingSockets);
    waitingSockets.forEach(s => {
       console.log('idsssss------------------'+s.id);
        //s.emit('playercount', { c: count });
        s.emit('BoardCards', { boardCARDS: boardCards });
        dealer = GetNextValidPlayerIndex(dealer);
        smallBlind = GetNextValidPlayerIndex(dealer);
        bigBlind = GetNextValidPlayerIndex(smallBlind);
        startIndex = GetNextValidPlayerIndex(bigBlind);
        s.emit('WaitRound',{roundNum : roundNumber,sbb: player_Blind[smallBlind].chips, bbb: player_Blind[bigBlind].chips, totalPot: totalBid,sb: smallBlind, bb: bigBlind});
        //s.emit("InIt", { sb: smallBlind, bb: bigBlind, si: startIndex });
        //s.emit("RemoveSmallbigBlindAmount", { sbb: player_Blind[smallBlind].chips, bbb: player_Blind[bigBlind].chips, totalPot: totalBid });

    });

   
}//WaitingPlayerinLobby

io.on('connection', function (socket) {
    console.log('-------Connection made------- on Port ' + portnum);
    sockets.push(socket);
    player = new Player();
    thisPlayerID = player.id;
    count++;
    socket.emit('playercount', { c: count });
    socket.emit('register', { id: thisPlayerID });
    if(isGameRunning){
        waitingPlayers[thisPlayerID] = player;
        waitingSockets.push(socket);
        //let t_count = count - waitingSockets.length+1;
        socket.emit("WaitList",{c: noOfplayers});
        WaitingPlayerinLobby();
    }
    else{
        player_Blind.push(player);
        players[thisPlayerID] = player;
        module.exports.player_Blind = player_Blind;
        if (count == noOfplayers) {
            // setInterval(function () {
            //     io.sockets.emit('timer', { time: timer });
            // }, MAX_WAITING);
            isGameRunning = true;
            StartGame(socket);
        }
    }
    

   
    socket.on('pass_turn', function () {
        if (sockets[_turn].id == socket.id) {
            tempBetValue = 0;
            io.sockets.emit("SetButtonNameOnClick", { turn: _turn, buttonName: 'Check' });
            CheckandCallNextTurn(socket);
        }
    });

    socket.on('buttonClick', function () {
        sockets[_turn].emit('activatebuttons');
    });


    socket.on('timerReset', function (data) {

        var jsonObject = JSON.stringify(data);
        var folderplayerindex = JSON.parse(jsonObject);
        var timerindex = folderplayerindex['Index'];
        console.log();
        io.sockets.emit('timeReset', { ti: timerindex });

    });


    socket.on('fold', function (data) {
        if (sockets[_turn] == socket) {
            var jsonObject = JSON.stringify(data);
            var folderplayerindex = JSON.parse(jsonObject);
            player_Blind[_turn].isCardFold = true;
            foldCount++;
            // count--;
            //counter--;
            var fpindex = folderplayerindex['Index'];
            io.sockets.emit('fold', { fpi: fpindex });
            console.log(counter + '----- check last turn' + count);
            CheckandCallNextTurn(socket);
        }
    });

    socket.on('RaiseClicked', function () {
        console.log(_turn);
        if (sockets[_turn] == socket) {
            if (player_Blind[_turn].chips > 0) {
                socket.emit("GetTotalPoints", { totalPoints: player_Blind[_turn].chips });
                console.log(player_Blind[_turn].chips + "  Pls set slider max valu ");
            }
            else
                socket.emit("PointsNullError");
        }
    });//Sets the Raise Slider value 

    socket.on("Raise", function (data) {
        if (sockets[_turn] == socket) {
            io.sockets.emit("SetButtonNameOnClick", { turn: _turn, buttonName: 'Raise' });
            tempBetValue = JsonConvertor(data, 'BetValue');
            currentRaiseValue += tempBetValue;
            player_Blind[_turn].totalBetPoints += currentRaiseValue;
            console.log("Before" + player_Blind[_turn].chips + "  " + tempBetValue + " " + currentRaiseValue);
            if (player_Blind[_turn].chips <= tempBetValue)
                player_Blind[_turn].chips = 0;
            else
                player_Blind[_turn].chips = player_Blind[_turn].chips - currentRaiseValue + player_Blind[_turn].betPoints;
            console.log("Player Chips " + player_Blind[_turn].chips);

            assignCallValue();
            player_Blind[_turn].betPoints = tempBetValue;
            checkAllIn();
            let temp = player_Blind[_turn].chips;
            io.sockets.emit("RemoveTotalValue", { totalchips: temp, betPoints: tempBetValue, turn: _turn, cv: callValue });
            //console.log(jObje['BetValue'] + "  Raise Value ");
            isCall = true;
            isCheck = false;
            io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });
            // io.sockets.emit("RemoveTotalValue", { totalchips: temp, turn: _turn });
            counter = 0;
            CheckandCallNextTurn(socket);
        }
    });

    socket.on("Call", function (data) {

        if (sockets[_turn] == socket) {
            io.sockets.emit("SetButtonNameOnClick", { turn: _turn, buttonName: 'Call' });
            tempBetValue = currentRaiseValue;
            console.log("call checking--- " + tempBetValue + " " + player_Blind[_turn].chips)
            if (tempBetValue >= player_Blind[_turn].chips) {
                tempBetValue = player_Blind[_turn].chips;
                player_Blind[_turn].chips = 0;
            }
            else {
                tempBetValue = currentRaiseValue - player_Blind[_turn].betPoints;
                console.log("TEMPBETVALUE " + tempBetValue + " riase" + currentRaiseValue + "   " + player_Blind[_turn].betPoints);
                player_Blind[_turn].chips = player_Blind[_turn].chips - currentRaiseValue + player_Blind[_turn].betPoints;
            }
            player_Blind[_turn].totalBetPoints += tempBetValue;
            checkAllIn();
            let temp = player_Blind[_turn].chips;
            assignCallValue();
            player_Blind[_turn].betPoints = tempBetValue;
            console.log(tempBetValue + '   bet value ');
            io.sockets.emit("RemoveTotalValue", { totalchips: temp, betPoints: tempBetValue, turn: _turn, cv: callValue });
            CheckandCallNextTurn(socket);
        }
    });

 

    socket.on('disconnect', function () {
        console.log('Player has Disconnected');
        //count--;
        //player_Blind.splice(player_Blind.indexOf(socket), 1);
        //players[thisPlayerID].isCardFold = true;
        delete players[thisPlayerID];
        console.log(thisPlayerID + ' is Offline');

        //delete players[thisPlayerID];
        //delete sockets[thisPlayerID];
        
        
    });

});

};



