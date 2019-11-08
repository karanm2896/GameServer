var dc=require('./DealCards');


       // public GameObject players;
    var noOfPlayers;
    var initialPlayerCount;
    var startTurnIndex = 0;
    var currentBetValue = 2;
    var currentTurnIndex;
    var totalBetValue;
    var currentIndex = 0;
    var tempRaisedIndex;
    var PreviousRaiseValue;
    var isRaised;
    var isFolded;
    var isConfirm;
    var roundFinish = false;
    var isNewRound;
    var smallBlind;
    var bigBlind;
    var indexOfBigBlind;
    var roundNumber = 0;
    var oldBp;
    

    // private void Awake()
    // {
    //     instance = this;
    //     noOfPlayers = players.GetComponentsInChildren<Transform>().GetLength(0) - 1;
    //     initialPlayerCount = noOfPlayers;
    //     tempRaisedIndex = noOfPlayers;
    // }

    function AssignSmallBigBlind()
    {
        Debug.Log(indexOfBigBlind + "  " + currentIndex + "Value On Small Blind");
        // ---------------- Assing Values to Small Blind Player---------------------------
        players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().totalPoints -= smallBlind;
        players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().betPoints = smallBlind;

        uiManager.instance.AssignTotalPointSValue(indexOfBigBlind, players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().totalPoints);
        uiManager.instance.OnClickButtonName(indexOfBigBlind, "Small Blind");
        uiManager.instance.AssignRaiseText(indexOfBigBlind, smallBlind);

        // Increase Indexs for Big Blind
        indexOfBigBlind++;
        currentIndex++;
        tempRaisedIndex = currentIndex; // currentIndex raise index need be change after dealer changes
        // Assign Current Value from big blind
        currentBetValue = bigBlind;
        // Debug.Log(currentIndex + "Value On Big Blind");
        // assign Raise ammout , pointer position and totalValue
        uiManager.instance.RaiseAmountText.text = currentBetValue.ToString();
        // Debug.Log(" Pointer Index Plus 1" + indexOfBigBlind);
        // reset currentIndex is 4
        if (indexOfBigBlind >= 4)
        {
            if (indexOfBigBlind == 4)
                uiManager.instance.pointer.transform.position = players.transform.GetChild(0).position + offset;

            else
            {
                currentIndex = 0;
                indexOfBigBlind = 0;
                uiManager.instance.pointer.transform.position = players.transform.GetChild(indexOfBigBlind).position + offset;
            }
        }
        else
            uiManager.instance.pointer.transform.position = players.transform.GetChild(indexOfBigBlind + 1).position + offset;


        uiManager.instance.totalPotValue.text = (bigBlind + smallBlind).ToString();
        totalBetValue = (bigBlind + smallBlind);

        //----------------Assign Values to Big Blind Plyer ------------------------------
        players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().totalPoints -= bigBlind;
        players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().betPoints = bigBlind;
        uiManager.instance.AssignTotalPointSValue(indexOfBigBlind, players.transform.GetChild(indexOfBigBlind).GetComponent<PlayerProperties>().totalPoints);
        // Debug.Log(indexOfBigBlind + " Index of BigBlind ");
        uiManager.instance.OnClickButtonName(indexOfBigBlind, "Big Blind");
        uiManager.instance.AssignRaiseText(indexOfBigBlind, bigBlind);
        currentIndex = indexOfBigBlind;
        SetTurnProperties();
    }

    void Start()
    {
        currentTurnIndex = startTurnIndex;
        players.transform.GetChild(currentTurnIndex).GetComponent<PlayerProperties>().isMyTurn = true;
        // Debug.Log("Current Player is + " + players.transform.GetChild(currentTurnIndex).name);
        AssignSmallBigBlind();
        // AssignTurnList();

    }

    void Update()
    {
        if (noOfPlayers == 1)
        {
            StartCoroutine(lastPlayer());
        }
    }

    IEnumerator lastPlayer()
    {

        for (int i = 0; i < 5; i++)
        {
            if (players.transform.GetChild(i).gameObject.activeSelf)
            {
                uiManager.instance.gamePlayButtons.SetActive(false);
                dc.winnerText.gameObject.SetActive(true);
                dc.winnerText.text = "Winner Player" + players.transform.GetChild(i).name;
            }

        }
        yield return null;
    }

    // set the turn cycle wiht next player
    void AssignTurnList()
    {
        int j = startTurnIndex;
        //   playerTurn = new List<GameObject>(5);
        for (int i = 0; i < 5; i++)
        {
            if (j < 5)
            {
                playerTurn[i] = players.transform.GetChild(j).gameObject;
                j++;
            }
            else
            {
                j = 0;
                playerTurn[i] = players.transform.GetChild(j).gameObject;
                j++;
            }
        }
        AddingCardsToPlayerProperties();
    }

    public void OnCheckButtonClick()
    {
        uiManager.instance.OnClickButtonName(currentIndex, "Check");
        if (currentIndex < players.transform.childCount)
        {
            // Debug.Log(players.transform.GetChild(currentIndex).name + " has Completed Turn " + currentIndex);
            SetTurnProperties();
        }
        else
        {
            //Debug.Log("All turn is completed Perform WinLosse function and Start New Game With New Start Index");
            currentIndex = 0;
            startTurnIndex += 1;
            currentTurnIndex = startTurnIndex;
            // AssignTurnList();
        }

    }

    public void OnCallButtonClicked()
    {
        if (isConfirm == false)
            uiManager.instance.OnClickButtonName(currentIndex, "Call");
        else
            uiManager.instance.OnClickButtonName(currentIndex, "Raise");



        isConfirm = false;
        if (!players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold)
        {
            // Debug.Log(currentIndex + "Not Fold Card");
            CalculateBetTotalPoints();
            // Debug.Log(totalBetValue + "   " + playerTurn[currentIndex].GetComponent<PlayerProperties>().betPoints + " " + playerTurn[currentIndex].GetComponent<PlayerProperties>().totalPoints);
            SetTurnProperties();
        }
        else
        {
            Debug.Log(currentIndex + "  " + players.transform.GetChild(currentIndex).name);
            currentIndex++;
            if (currentIndex <= 4)
            {
                CalculateBetTotalPoints();
                Debug.Log(currentIndex);

            }
            SetTurnProperties();
        }
    }

    void CalculateBetTotalPoints()
    {

        if (!players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold)
        {
            if (currentBetValue > players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints)
            {
                Debug.Log("Call For ALL IN or Call total points");
                players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints += players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints;
                totalBetValue += players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints;
                players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints = 0;
            }
            else
            {

                if (players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints != 0)
                    oldBp = players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints;



                // Debug.Log(currentBetValue + " " + PreviousRaiseValue);
                if (currentBetValue != PreviousRaiseValue)
                {
                    Debug.Log("Re-Raise");
                    uiManager.instance.AssignRaiseText(currentIndex, Mathf.Abs(currentBetValue - PreviousRaiseValue));
                    //uiManager.instance.
                    players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints = currentBetValue;
                    players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints -= currentBetValue;
                    PreviousRaiseValue = currentBetValue;
                    totalBetValue += currentBetValue;
                }
                else
                {
                    Debug.Log("Raise");

                    uiManager.instance.AssignRaiseText(currentIndex, currentBetValue);

                    players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints = currentBetValue;
                    Debug.Log(oldBp);
                    players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints -= players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().betPoints - oldBp;
                    PreviousRaiseValue = currentBetValue;
                    totalBetValue += currentBetValue - oldBp;
                }
                uiManager.instance.totalPotValue.text = totalBetValue.ToString();
                uiManager.instance.AssignTotalPointSValue(currentIndex, players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().totalPoints);
                CheckAndAssignRaiseValue(currentIndex);
            }
        }
        else
        {
            //  currentIndex++;
        }
    }

    void CheckAndAssignRaiseValue(int pastRaiseIndex)
    {
        if (pastRaiseIndex < 4)
            Debug.Log(pastRaiseIndex);
        else
        {
            if (pastRaiseIndex == 4)
            {
                pastRaiseIndex = -1;
            }
            else
            {
                pastRaiseIndex = 0;
            }
        }

        // Debug.Log(pastRaiseIndex + " PAsst Index and next bet points" + players.transform.GetChild(pastRaiseIndex + 1).GetComponent<PlayerProperties>().betPoints);
        if (players.transform.GetChild(pastRaiseIndex + 1).GetComponent<PlayerProperties>().betPoints > 0)
        {
            // Debug.Log(currentBetValue + " Next Plyer Bet points " + players.transform.GetChild(pastRaiseIndex + 1).GetComponent<PlayerProperties>().betPoints);
            uiManager.instance.RaiseAmountText.text = (currentBetValue - players.transform.GetChild(pastRaiseIndex + 1).GetComponent<PlayerProperties>().betPoints).ToString();
        }
        else
        {
            uiManager.instance.RaiseAmountText.text = currentBetValue.ToString();
        }
    }

    public void TurnCheck_current_next()
    {
        do
        {
            temp_reset();
        }
        while (players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold == true);
    }

    public void temp_reset()
    {
        currentIndex++;
        if (tempRaisedIndex == currentIndex)
        {
            roundFinish = true;
        }
        if (currentIndex == 5)
        {
            currentIndex = 0;
        }
    }

    // turn properties removing past index and assign currnet index
    void SetTurnProperties()
    {
        if (SceneManager.GetActiveScene().name == "GameScenewithUI")
            uiManager.instance.p1timerImage[currentIndex].fillAmount = 1;
        if (currentIndex < 4)
        {

            if (players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold == true || players.transform.GetChild(currentIndex + 1).GetComponent<PlayerProperties>().isCardFold == true)
            {
                TurnCheck_current_next();
            }
            else
            {
                temp_reset();
            }

        }
        else
        {
            if (players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold == true || players.transform.GetChild(0).GetComponent<PlayerProperties>().isCardFold == true)
            {
                TurnCheck_current_next();
            }
            else
            {
                temp_reset();
            }
        }


        Debug.Log(tempRaisedIndex + " " + currentIndex + "  ");


        if (tempRaisedIndex == currentIndex)
        {
            roundFinish = true;
        }
        else
        {
            Debug.Log("Not Equal");
        }



        if (roundFinish)
        {
            roundNumber++;
            if (roundNumber == 1)
            {
                for (int i = 0; i < 3; i++)
                {
                    Board.GetChild(i).gameObject.SetActive(true);
                }
                currentBetValue = 0;
                ResetPlayerBetPoints();

            }
            else if (roundNumber == 2)
            {
                Board.GetChild(3).gameObject.SetActive(true);
                currentBetValue = 0;
                ResetPlayerBetPoints();
            }
            else if (roundNumber == 3)
            {
                Board.GetChild(4).gameObject.SetActive(true);
                currentBetValue = 0;
                ResetPlayerBetPoints();
            }
            PreviousRaiseValue = 0;
            uiManager.instance.ResetTextOnRoundComplete();
            uiManager.instance.gamePlayButtons.transform.GetChild(1).gameObject.SetActive(true);
            uiManager.instance.gamePlayButtons.transform.GetChild(2).gameObject.SetActive(false);
            uiManager.instance.RaiseAmountText.text = "";
            //Debug.Log("Round " + roundNumber + "Begins");
            isRaised = false;
            if (roundNumber == 4)
            {
                dc.evaluateHands();
                uiManager.instance.gamePlayButtons.SetActive(false);
                uiManager.instance.pointer.SetActive(false);
                // DealCards.instance.evaluateHands();

                Debug.Log(currentIndex);
                StartCoroutine(ClearRoundPropertiesSetNew());
                startTurnIndex += 1;
                currentTurnIndex = startTurnIndex;
                //  AssignTurnList(); // set the cycle with new player             
            }
            roundFinish = false;
            Debug.Log("What");
        }
        uiManager.instance.pointer.transform.position = players.transform.GetChild(currentIndex).transform.position + offset;
        oldBp = 0;

    }

    IEnumerator ClearRoundPropertiesSetNew()
    {
        yield return new WaitForSeconds(3);
        uiManager.instance.gamePlayButtons.SetActive(true);
        uiManager.instance.pointer.SetActive(true);

        ClearPlayerChildObject();
        dc.winnerText.gameObject.SetActive(false);
        roundNumber = 0;
        uiManager.instance.gamePlayButtons.transform.GetChild(2).gameObject.SetActive(true);
        uiManager.instance.gamePlayButtons.transform.GetChild(1).gameObject.SetActive(false);
        //noOfPlayers = players.GetComponentsInChildren<Transform>().GetLength(0) - 1;
        //initialPlayerCount = noOfPlayers;
        //Debug.Log(initialPlayerCount + "   Initial COunt");
        for (int i = 0; i < initialPlayerCount; i++)
        {
            players.transform.GetChild(i).gameObject.SetActive(true);
            players.transform.GetChild(i).GetComponent<PlayerProperties>().isCardFold = false;
        }
        dc.SetDeck();
        dc.Deal();
        AssignSmallBigBlind();
        if (currentIndex > 4)
            currentIndex = 0;
        uiManager.instance.gameOver = false;
        //StartCoroutine(waitPls());
        // boardCards
    }

    void ClearPlayerChildObject()
    {
        for (int i = 0; i < players.transform.childCount; i++)
        {
            for (int j = 0; j < 2; j++)
            {
                if (players.transform.GetChild(i).transform.GetChild(j) != null)
                    Destroy(players.transform.GetChild(i).transform.GetChild(j).gameObject);
            }
        }

        for (int k = 0; k < Board.transform.childCount; k++)
        {
            if (Board.transform.GetChild(k) != null)
                Destroy(Board.transform.GetChild(k).gameObject);
            else
                Debug.Log("NULLLLL");
        }
    }


    //Set turn index values using bool
    void SetTurn(bool isMyturn, int pastIndex)
    {
        // Debug.Log(isMyturn + " " + pastIndex);
        if (pastIndex < players.transform.childCount)// && pastIndex != 0
            players.transform.GetChild(pastIndex).GetComponent<PlayerProperties>().isMyTurn = isMyturn;
    }

    //assign cards to player properties
    void AddingCardsToPlayerProperties()
    {
        int indexOfPlayerCards = 0;
        for (int i = 0; i < players.transform.childCount; i++) // Adding Cards to player properties
        {
            int indexOfBoardCards = 0;
            for (int j = 0; j < 2; j++)
            {
                players.transform.GetChild(i).GetComponent<PlayerProperties>().cards[j] = playerCards[indexOfPlayerCards];
                indexOfPlayerCards++;
            }
            for (int l = 2; l < 7; l++) // Adding Board Cards to player properties
            {
                // Debug.Log(playerTurn[i].name + " " + l);
                players.transform.GetChild(i).GetComponent<PlayerProperties>().cards[l] = boardCards[indexOfBoardCards];
                indexOfBoardCards++;
            }
        }
    }

    // using highest hand index assign winning bet points to winner
    public void AddWinningBetToWinner(int winnerIndex)
    {
        //playerTurn[winnerIndex].GetComponent<PlayerProperties>().totalPoints += totalBetValue;
        players.transform.GetChild(winnerIndex).GetComponent<PlayerProperties>().totalPoints += totalBetValue;
    }


    public void OnFoldButtonClick()
    {
        Debug.Log(currentIndex + "Current Index of Player");
        uiManager.instance.OnClickButtonName(currentIndex, "Fold");
        //players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold = true;
        players.transform.GetChild(currentIndex).GetComponent<PlayerProperties>().isCardFold = true;
        players.transform.GetChild(currentIndex).transform.gameObject.SetActive(false);
        // players.transform.GetChild(currentIndex).gameObject.SetActive(false);
        noOfPlayers = (players.GetComponentsInChildren<Transform>().GetLength(0) - 1) / 3;

        SetTurnProperties();
        isFolded = true;
        //currentIndex++;
    }

    public void OnConfirmRaiseButtonClick()
    {
        uiManager.instance.OnClickButtonName(currentIndex, "Raise");
        currentBetValue += (int)uiManager.instance.bidSlider.value;

        //raiseValue = (int)uiManager.instance.bidSlider.value;
        //  uiManager.instance.RaiseAmountText.text = currentBetValue.ToString();
        OnRaiseChangePlayerTurnList();
        isRaised = true;
        isConfirm = true;
        OnCallButtonClicked();
        uiManager.instance.gamePlayButtons.transform.GetChild(1).gameObject.SetActive(false);// hide check button on raise
        uiManager.instance.gamePlayButtons.transform.GetChild(2).gameObject.SetActive(true);// Show Call button 
        uiManager.instance.raiseAdditionalPanel.SetActive(false);

    }

    void OnRaiseChangePlayerTurnList()
    {
        Debug.Log(noOfPlayers);

        tempRaisedIndex = currentIndex;

        Debug.Log(currentIndex + "Before adding to list");
        //if (currentIndex > 4)
        //    currentIndex = 0;

    }

    bool CheckAllBetPoints()
    {
        Debug.Log(totalBetValue % noOfPlayers);
        if (totalBetValue % noOfPlayers == 0)
        {
            isRaised = true;
            return isRaised;
        }
        else
        {
            isRaised = false;
            return false;
        }


    }
    void ResetPlayerBetPoints()
    {
        for (int i = 0; i < players.transform.childCount; i++)
        {
            players.transform.GetChild(i).GetComponent<PlayerProperties>().betPoints = 0;
        }
    }
}