const app = function() {
    const game = {};
    const suits = ['spades', 'hearts', 'clubs', 'diams'];
    const ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    const score = [0, 0];

    function init(){
        gamePlay();
        switchOff(game.btnHit);
        switchOff(game.btnStand);
        cardDeck();
        addEvents();
        scoreBoard();
        reset();
    }

    //Setting up the gameplay through the DOM and the game object
    function gamePlay() {
        game.main = $('#game');
        console.log(game);
        game.scoreboard = $('<div>').addClass('scoreboard');
        game.scoreboard.text('Dealer 0 vs Player 0');
        game.main.append(game.scoreboard);

        game.table = $('<div>').addClass('players');

        game.dealer = $('<div>').addClass('players');
        game.table.append(game.dealer);

        game.dealerCards = $('<div>').addClass('players');
        game.dealerCards.text('DEALER CARD');
        
        game.dealerScore = $('<div>').addClass('score');
        game.dealerScore.text('-');
        game.dealer.append(game.dealerScore);
        game.dealer.append(game.dealerCards);

        game.player = $('<div>').addClass('players')
        game.table.append(game.player);

        game.playerCards = $('<div>').addClass('players');
        game.playerCards.text('PLAYER CARD');
        
        game.playerScore = $('<div>').addClass('score');
        game.playerScore.text('-');
        game.player.append(game.playerScore); 
        game.player.append(game.playerCards);       
        
        game.dashboard = $('<div>');
        game.status = $('<div>').addClass('message');
        game.status.text('Message for Player');
        game.dashboard.append(game.status);

        game.btnDeal = $('<button>').addClass('btn');
        game.btnDeal.text('DEAL');
        game.dashboard.append(game.btnDeal);

        game.btnHit = $('<button>').addClass('btn');
        game.btnHit.text('HIT');
        game.dashboard.append(game.btnHit);

        game.btnStand = $('<button>').addClass('btn');
        game.btnStand.text('STAND');
        game.dashboard.append(game.btnStand);

        game.resetArea = $('<div>');
        game.btnReset = $('<button>').addClass('reset');
        game.btnReset.text('Reset game');
        game.resetArea.append(game.btnReset);

        game.table.append(game.dashboard);
        game.main.append(game.table);
        game.table.append(game.resetArea);
    };

    //Updating the scores after each round
    function scoreBoard() {
        game.scoreboard.text(`Dealer ${score[0]} vs Player ${score[1]}`);
    };

    //Creation of the deck of cards
    function cardDeck() {
        game.deck = [];
        for (let i=0; i<suits.length; i++){
            for (let j=0; j<ranks.length; j++){
                let card = {};
                let tempValue = isNaN(ranks[j]) ? 10 : ranks[j];
                tempValue = (ranks[j] === 'A') ? 11 : tempValue;

                card.suit = suits[i];
                card.rank = ranks[j];
                card.value = tempValue;
                game.deck.push(card);
            };
        };
        randomCard(game.deck);
    };

    //Randomising the deck of cards
    function randomCard(cards) {
        cards.sort(function() {
            return .5 - Math.random();
        })
        return cards;
    };

    //Adding events to the buttons
    function addEvents() {
        game.btnDeal.on('click', distribute);
        game.btnStand.on('click', playerStand);
        game.btnHit.on('click', moreCard);
    };

    //Functions to manage the buttons behaviour
    function switchOff(btn) {
        btn.prop('disabled', true);
        btn.css('backgroundColor', '#ddd');
    };

    function switchOn(btn) {
        btn.prop('disabled', false);
        btn.css('backgroundColor', '#000');
    };

    //Setting up the cards in order to show them on the table using CSS
    function showCard(card, el) {
        if (card != undefined) {
        el.css('backgroundColor', 'hsl(131, 20%, 50%)');
        let div = $('<div>').addClass('card');
        if (card.suit === 'hearts' || card.suit === 'diams') {
            div.addClass('redCard');
        };

        let span1 = $('<div>').addClass('smallArea');
        span1.html(`${card.rank}&${card.suit};`);
        div.append(span1);

        let span2 = $('<div>').addClass('bigArea');
        span2.html(card.rank);
        div.append(span2);

        
        let span3 = $('<div>').addClass('bigArea');
        span3.html(`&${card.suit};`);
        div.append(span3);

        el.append(div);
        }
    };

    //Picking up cards for players
    function cardPick(hand, element, hidden) {
        if (game.deck.length === 0) {
            cardDeck();
        };
        let temp = game.deck.shift();
        hand.push(temp);
        showCard(temp, element);
        if (hidden) {
            game.cardBack = $('<div>').addClass('cardB');
            element.append(game.cardBack);
        }
    };

    //Logic for the Aces
    function aceLogic(val, aces) {
        if (val < 21) {
            return val;
        } else if (aces > 0) {
            aces--;
            val = val - 10;
            return aceLogic(val, aces);
        } else {
            return val;
        }
    };

    //Logic for the sum of cards and calculating scores
    function scorer(hand) {
        let total = 0;
        let ace = 0;
        hand.forEach(function(card) {
            if (card.rank === 'A') {
                ace++;
            }
            total = total + Number(card.value);
        })
        if (ace > 0 && total > 21) {
            total = aceLogic(total, ace);
        };
        if (total > 21) {
            roundEnd();
            return Number(total);
        };

        return Number(total);
    };

    //Distributing the cards
    function distribute() {
        game.dealerHand = [];
        game.playerHand = [];
        game.dealerScore.text('-');
        game.start = true;
        switchOff(game.btnDeal);
        game.playerCards.html('');
        game.dealerCards.html('');
        cardPick(game.dealerHand, game.dealerCards, true);
        cardPick(game.dealerHand, game.dealerCards, false);
        cardPick(game.playerHand, game.playerCards, false);
        cardPick(game.playerHand, game.playerCards, false);
        cardCount();
    };

    //Turning off the buttons hit and stand when the round is over
    function roundEnd() {
        switchOff(game.btnHit);
        switchOff(game.btnStand);
    };


    //Outputting player's score depending on result as well as gameplay messages and button behaviour
    function cardCount() {
        let player = scorer(game.playerHand);
        let dealer = scorer(game.dealerHand);
        game.playerScore.text(player);
        if (player < 21) {
            switchOn(game.btnHit);
            switchOn(game.btnStand);
            game.status.text('Stand or take another card');
        } else if (player > 21) {
            game.dealerScore.text(dealer)
            winner();
        } else {
            game.status.text('Dealer in play to 17 minimum');
            dealerPlay(dealer);
        }
        if (dealer === 21 && game.dealerHand.length === 2) {
            game.dealerScore.text(dealer);
            game.status.html('Dealer got BlackJack.<br>');
            roundEnd();
            winner();
        } 
    };

    //Logic when player hits stand button
    function playerStand() {
        dealerPlay();
        switchOff(game.btnHit);
        switchOff(game.btnStand);
    };

    //Logic when player hits hit button
    function moreCard() {
        cardPick(game.playerHand, game.playerCards, false);
        cardCount();
    };

    //Dealer behaviour 
    function dealerPlay(){
        let dealer = scorer(game.dealerHand);
        game.cardBack.css('display', 'none');
        game.status.html(`Dealer scores ${dealer}. <br>`);
        if (dealer >= 17) {
            game.dealerScore.text(dealer);
            winner();
        } else {
            cardPick(game.dealerHand, game.dealerCards, false);
            game.dealerScore.text(dealer);
            dealerPlay();
        }
    };

    //Finding the winner and updating the message as well as the scores
    function winner(){
        let player = scorer(game.playerHand);
        let dealer = scorer(game.dealerHand);
        if (player > 21) {
            game.status.html(`You are out with ${player}. <br>`);
        };
        if (dealer > 21) {
            game.status.html(`Dealer is out with ${dealer}. <br>`);
        };
        if (player === dealer) {
            game.status.text(`Draw, no winner. Play again.`);
        } else if ((player < 22 && player > dealer) || dealer > 21) {
            game.status.append(`You Win with ${player} `);
            score[1]++
        } else {
            game.cardBack.css('display', 'none');
            game.status.append('Dealer wins... try again.');
            score[0]++
        }
        scoreBoard();
        switchOff(game.btnHit);
        switchOff(game.btnStand);
        switchOn(game.btnDeal);
    };

    //Ability for the player to reset the scores
    function reset() {
        game.btnReset.on('click', function() {
            document.location.href = '';
        });
    };


    return {
        init: init
    };
}();

