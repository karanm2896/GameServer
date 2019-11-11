var io = require('socket.io')(process.env.PORT || 5012);
var dealCardsCLASS = require('./GameScripts/DealCards');
//var deckofcards = require('./GameScripts/DeckOfCards');

var check = process.env.PORT || 5012;
var Player = require('./Player');

var players = [];
let sockets = [];
var thisPlayerID;
console.log('Server Has Started');
console.log(process.env.PORT);
console.log(check);
var dealCardsOBJ;
var noOfplayers = 2;
var initialPlayerCount = noOfplayers;
var tempRaisedIndex = noOfplayers;
var thisPlayer;// = new Player();
let current_turn = 0;
let timeOut;
var _turn = 0;
let roundNumber = 0;
let totalPlayer = 0;
const MAX_WAITING = 1000;
let counter = 0;
let currentIndex = 0;
let dealer = -1;
var isGameCompleted = false, isRoundCompleted = false;
let startIndex = 0;
let smallBlindBid = 25, bigBlindBid = 50;
let smallBlind = 0, bigBlind = 0;
let player_Blind = [], sortPlayer_blindChips = [];
var player;
var boardCards = [];
//var noOfplayers = 2;
var count = 0;
let totalBid = 0, tempBetValue = 0, currentRaiseValue = 0, callValue = 0;
var timer = 15;
let isCheck = false, isCall = false;
let allPot = []; let PotDistribution = [], indexforPot = 0;
let isAllInSet = false;
let roundPots = [0, 0, 0, 0];

function next_turn() {

    console.log(player_Blind[_turn].isCardFold);
    if (player_Blind[_turn].isCardFold == false) {
        ResetTurn();
        if (currentRaiseValue == 0)
            totalBid += tempBetValue;
        else
            totalBid += currentRaiseValue;
       console.log('total biddd'+ totalBid);
        assignCallValue();
    }
    if (player_Blind[_turn].isCardFold == true || (player_Blind[_turn].chips == 0)) {
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
        _turn++;
    }
}//MoveTurnonFold

function ResetTurn() {
    sockets[_turn].emit('deactivatebuttons');
    _turn++;
    if (_turn == player_Blind.length)
        _turn = 0;
}//ResetTurn


function assignCallValue() {
    // if (player_Blind[_turn].isCardFold == true || (player_Blind[_turn].chips == 0)) {
    //     console.log("Fold or All-IN");
    //     ResetTurn();
    //     MoveTurnonFold();
    //     }
    // else {
        if (player_Blind[_turn].betPoints > 0)
            callValue = Math.abs(currentRaiseValue - player_Blind[_turn].betPoints);
        else {
            if (isRoundCompleted == true) {
                isRoundCompleted = false;
                tempBetValue = 0;
                callValue = 0;
            }
            else
                callValue = currentRaiseValue;
    
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
    //let players = [];

    let tempSmall = player_Blind[smallBlind].chips;
    let tempBig = player_Blind[bigBlind].chips;

    console.log(smallBlindBid + "  " + bigBlindBid);
    // if (isGameCompleted == true) {
    //     isGameCompleted = false;

    dealer += 1;
    if (dealer >= player_Blind.length) {
        dealer = 0;
    }
    smallBlind = dealer + 1;
    if (smallBlind >= player_Blind.length) {
        smallBlind = 0;
    }
    console.log(player_Blind.length + "  " + smallBlind + " " + bigBlind);
    bigBlind = smallBlind + 1;
    if (bigBlind >= player_Blind.length) {
        bigBlind = 0;
    }
    startIndex = bigBlind + 1;
    if (startIndex >= player_Blind.length) {
        startIndex = 0;
    }
    // startIndex;
    _turn = startIndex;
    tempSmall -= smallBlindBid;
    player_Blind[smallBlind].chips -= smallBlindBid;
    tempBig -= bigBlindBid;
    player_Blind[bigBlind].chips -= bigBlindBid;

    player_Blind[smallBlind].betPoints = smallBlindBid;
    player_Blind[bigBlind].betPoints = bigBlindBid;
    currentRaiseValue = bigBlindBid;
    assignCallValue();
    io.sockets.emit("InIt", { sb: smallBlind, bb: bigBlind, si: startIndex });
    for (let i = 0; i < player_Blind.length; i++) {
        io.sockets.emit("AssignTotalValues", { tc: player_Blind[i].chips, tp: player_Blind.length });
        //console.log(player_Blind[i].chips);
    }
    totalBid = smallBlindBid + bigBlindBid;
    isCall = true;
    isCheck = false;
    io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });
    io.sockets.emit("setPlayerBetPoints", { sbbp: smallBlindBid, bbbp: bigBlindBid,cv: callValue });
    io.sockets.emit("RemoveSmallbigBlindAmount", { sbb: player_Blind[smallBlind].chips, bbb: player_Blind[bigBlind].chips, totalPot: totalBid  });
    counter++;
    //console.log(players[bigBlind].chips + "  " + players[smallBlind].chips + "Small blind Index is " + smallBlind + "  Big blind Index is" + bigBlind + " startIndex is" + startIndex);
}//assignSmallBigBlindAndCurrentPlyer


// function ShowNumberOfCards(displayNoOFCards) {
//     console.log(displayNoOFCards);
//     io.sockets.emit("ShowCards", { r: displayNoOFCards });
// }

function StartGame(socket) {
    dealCardsOBJ = new dealCardsCLASS(noOfplayers);
    dealCardsOBJ.Deal();
    PotDistribution[0] = [0, 1, 2];
    allPot[0] = 150;
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

    // console.log(boardCards);

    assignSmallBigBlindAndCurrentPlyer();
    sockets[_turn].emit('activatebuttons');
    sockets[_turn].broadcast.emit('deactivatebuttons');
    console.log(players);

    socket.emit('BoardCards', { boardCARDS: boardCards });
    socket.broadcast.emit('BoardCards', { boardCARDS: boardCards });

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

function checkAllIn(tempBetValue) {
    if (player_Blind[_turn].chips <= tempBetValue) {
    player_Blind[_turn].isAllIn = true;
    isAllInSet = true;
    CalculateAllIn();
        }
}//checkAllIn

function CalculateAllIn() {
    let potValues = 0, lastLowestAmount = 0, totalPotPlayers = 0;
    sortPlayer_blindChips = [];
    //sortPlayer_blindChips = player_Blind;
    // sortPlayer_blindChips.sort((a, b) => (a.chips > b.chips) ? 1 : ((b.chips > a.chips) ? -1 : 0));
    for (let i = 0; i < player_Blind.length; i++) {
    if (!player_Blind[i].isCardFold && player_Blind[i].chips > 0) {
    totalPotPlayers++;
    sortPlayer_blindChips.push(player_Blind[i].totalBetPoints);
    console.log(" values added to sorted array " + player_Blind[i].chips);
    //sortPlayer_blindChips = _.sortBy(player_Blind, 'chips');
    if (PotDistribution[i] == null)
    PotDistribution[i] = [];
    PotDistribution[indexforPot].push(i);
    console.log(" pot player index  " + PotDistribution[i]);
    }
    else {
    console.log('fold and chips 0 indexs are ' + i);
    }
    }
    sortPlayer_blindChips.sort(function (a, b) { return a - b });
    console.log('sorted Array' + sortPlayer_blindChips);
    lastLowestAmount = sortPlayer_blindChips[0];
    potValues = (sortPlayer_blindChips[0] * totalPotPlayers);
    console.log("First Pot" + potValues);
    allPot.push(potValues);
    indexforPot++;
    isAllInSet = false;
}//CalculateAllIn

// function compare(a, b) {
//     if (a.last_nom < b.last_nom) {
//     return -1;
//     }
//     if (a.last_nom > b.last_nom) {
//     return 1;
//     }
//     return 0;
//     }

function JsonConvertor(data,valuname){
    var jsonObject = JSON.stringify(data);
    var jObje = JSON.parse(jsonObject);
    return jObje[valuname];
}

function CheckandCallNextTurn(socket) {
    counter++;
    isGameCompleted = false;
    console.log(counter + " COunter Total player " + count);
    if (counter == count) {
        // ---------- Round Completed --------------- //
        counter = 0;
        currentRaiseValue = 0;
       
        console.log(" round Number " + roundNumber);
        isCall = false;
        isCheck = true;
        io.sockets.emit("SetCallCheckButton", { call: isCall, check: isCheck });
        for (let j = 0; j < player_Blind.length; j++) {
            roundPots[roundNumber] += player_Blind[j].betPoints;
            player_Blind[j].betPoints = 0;
        }
        console.log("round pots valeus " + roundPots[roundNumber]);
        roundNumber += 1;
        if (roundNumber == 4) {

            for (let i = 0; i < 1; i++) {
                dealCardsOBJ.Newevaluate(PotDistribution[i]);
            var winn = dealCardsCLASS.highestHandindex;

            //io.sockets.emit("WinGame", { winner: winn });
            player_Blind[winn - 1].chips += totalBid;
            io.sockets.emit("WinGame", { winner: winn, addvalue: player_Blind[winn - 1].chips });
            //socket.broadcast.emit("WinGame", { winner: winn });

            for (let i = 0; i < allPot.length; i++) {
                console.log(allPot[i] + " pot devided between this index " + PotDistribution[i]);
                }

            isGameCompleted = true;
            roundNumber = 0;
            count = noOfplayers;
            
            for (var p_id in players) {
                players[p_id].isCardFold = false;
            }
            io.sockets.emit('NewRound');
            
            StartGame(socket);
            //assignSmallBigBlindAndCurrentPlyer();
            console.log('-----Game Completed------');
        }

    }
}
    io.sockets.emit('RoundFINISH', { roundNo: roundNumber });
   
    if (isGameCompleted == false) {
        next_turn();
    }


}//CheckandCallNextTurn

io.on('connection', function (socket) {
    console.log('-------Connection made-------');
    sockets.push(socket);
    count = count + 1;
    socket.emit('playercount', { c: count });
    player = new Player();
    thisPlayerID = player.id;

    player_Blind.push(player);
    players[thisPlayerID] = player;
    //sockets[thisPlayerID] = socket;
    
    //console.log(count);
    
    socket.emit('register', { id: thisPlayerID });

    module.exports.player_Blind = player_Blind;
    if (count == noOfplayers) {
        // setInterval(function(){
        //     io.sockets.emit('timer',{time:timer});
        //   }, MAX_WAITING);   
        StartGame(socket);
    }
    
    socket.on('pass_turn', function () {

        if (sockets[_turn].id == socket.id) {
            tempBetValue = 0;
            io.sockets.emit("SetButtonNameOnClick", { turn: _turn, buttonName: 'Check' });
            CheckandCallNextTurn(socket);
        }
    });

    socket.on('buttonClick',function(){
            sockets[_turn].emit('activatebuttons');
    });


    socket.on('timerReset',function(data){
        
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
            count--;
            var fpindex = folderplayerindex['Index'];
            io.sockets.emit('fold', { fpi: fpindex });
           // if(count > 1)
                next_turn();
            //else
               // CheckandCallNextTurn(socket);
        }
    });

    socket.on('RaiseClicked', function () {
        console.log(_turn);
        if (sockets[_turn] == socket) {
            if (player_Blind[_turn].chips > 0) {
                socket.emit("GetTotalPoints", { totalPoints: player_Blind[_turn].chips });
                console.log(player_Blind[_turn].chips + "  Pls set slider max valu ");
            }
            else{
                socket.emit("PointsNullError");
            }
               
        }
    });

    // socket.on("israised",function(){
    //     io.sockets.emit('isRaised');
    // });

    socket.on("Raise", function (data) {
        if (sockets[_turn] == socket) {
            //tempRaisedIndex = _turn;
            io.sockets.emit("SetButtonNameOnClick", { turn: _turn, buttonName: 'Raise' });
            // var jsonObject = JSON.stringify(data);
            // var jObje = JSON.parse(jsonObject);
            //tempBetValue = jObje['BetValue'];
            tempBetValue = JsonConvertor(data,'BetValue');
            //if (player_Blind[_turn].betPoints > 0)

            currentRaiseValue += tempBetValue;
            checkAllIn(tempBetValue);

            console.log("Before" + player_Blind[_turn].chips + "  " + tempBetValue + " " + currentRaiseValue);
            if (player_Blind[_turn].chips == tempBetValue){
                player_Blind[_turn].chips = 0;
                // player_Blind[_turn].Allin = true;
                // CalculateAllin(tempBetValue);
            }
            else
                player_Blind[_turn].chips = player_Blind[_turn].chips - currentRaiseValue + player_Blind[_turn].betPoints;
            console.log(player_Blind[_turn].chips);


            assignCallValue();
            player_Blind[_turn].betPoints = tempBetValue;
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
            // var jsonObject = JSON.stringify(data);
            // var jObje = JSON.parse(jsonObject);
            // tempBetValue = jObje['BetValue'];
            tempBetValue = JsonConvertor(data,'BetValue');
            player_Blind[_turn].totalBetPoints += tempBetValue;
            checkAllIn(tempBetValue);
            player_Blind[_turn].chips = player_Blind[_turn].chips - currentRaiseValue + player_Blind[_turn].betPoints;
            let temp = player_Blind[_turn].chips;
            assignCallValue();
            io.sockets.emit("RemoveTotalValue", { totalchips: temp, betPoints: tempBetValue, turn: _turn, cv: callValue });
            CheckandCallNextTurn(socket);
        }
    });


    socket.on('disconnect', function () {
        console.log('Player has Disconnected');
        player_Blind.splice(player_Blind.indexOf(socket), 1);
        count--;
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
    });



});