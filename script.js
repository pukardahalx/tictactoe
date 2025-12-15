let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let gameMode = null; 

const modeSelection = document.getElementById('mode-selection');
const turnSelection = document.getElementById('turn-selection');
const gameArea = document.getElementById('game-area');
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart-button');

const HUMAN_PLAYER = 'X';
const COMPUTER_PLAYER = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const setScreen = (screen) => {
    modeSelection.classList.add('hidden');
    turnSelection.classList.add('hidden');
    gameArea.classList.add('hidden');

    if (screen === 'mode') {
        modeSelection.classList.remove('hidden');
    } else if (screen === 'turn') {
        turnSelection.classList.remove('hidden');
    } else if (screen === 'game') {
        gameArea.classList.remove('hidden');
    }
};

const initializeGame = (startingPlayer) => {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = startingPlayer; 
    setScreen('game');
    
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('player-x', 'player-o');
    });

    statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;

    if (gameMode === 'pvc' && currentPlayer === COMPUTER_PLAYER) {
        setTimeout(handleComputerMove, 500); 
    }
};

const checkWin = (currentBoard, player) => {
    return winningConditions.some(condition => {
        return condition.every(index => currentBoard[index] === player);
    });
};

const handleResultValidation = () => {
    if (checkWin(board, currentPlayer)) {
        let winnerText = (gameMode === 'pvc' && currentPlayer === COMPUTER_PLAYER) ? 'Computer has won!' : `Player ${currentPlayer} has won!`;
        statusDisplay.innerHTML = winnerText;
        isGameActive = false;
        return true;
    }

    if (!board.includes('')) {
        statusDisplay.innerHTML = `It's a Draw!`;
        isGameActive = false;
        return true;
    }

    changePlayer();
    return false;
};

const changePlayer = () => {
    
    currentPlayer = currentPlayer === HUMAN_PLAYER ? COMPUTER_PLAYER : HUMAN_PLAYER;
    statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;

    if (gameMode === 'pvc' && isGameActive && currentPlayer === COMPUTER_PLAYER) {
        setTimeout(handleComputerMove, 700);
    }
};

const makeMove = (index, player, currentBoard = board) => {
    
    currentBoard[index] = player;
    
    if (currentBoard === board) { 
        const cellElement = cells[index];
        cellElement.innerHTML = player;
        
        
        cellElement.classList.add(player === HUMAN_PLAYER ? 'player-x' : 'player-o');
    }
    return currentBoard;
};

const handleCellClick = (e) => {
    const clickedCellIndex = parseInt(e.target.getAttribute('data-index'));

    if (!isGameActive || board[clickedCellIndex] !== '' || (gameMode === 'pvc' && currentPlayer === COMPUTER_PLAYER)) {
        return;
    }

    
    makeMove(clickedCellIndex, currentPlayer); 
    handleResultValidation();
};

const emptySquares = (currentBoard) => {
    return currentBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);
};

const scores = {
    [COMPUTER_PLAYER]: 10,
    [HUMAN_PLAYER]: -10,
    'tie': 0
};

const minimax = (newBoard, player) => {
    const availableSpots = emptySquares(newBoard);

    if (checkWin(newBoard, COMPUTER_PLAYER)) {
        return scores[COMPUTER_PLAYER];
    } else if (checkWin(newBoard, HUMAN_PLAYER)) {
        return scores[HUMAN_PLAYER];
    } else if (availableSpots.length === 0) {
        return scores['tie'];
    }

    let moves = [];
    
    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = availableSpots[i];
        
        let nextBoard = [...newBoard];
        nextBoard[availableSpots[i]] = player;

        if (player === COMPUTER_PLAYER) {
            move.score = minimax(nextBoard, HUMAN_PLAYER);
        } else {
            move.score = minimax(nextBoard, COMPUTER_PLAYER);
        }

        moves.push(move);
    }

    let bestMove;

    if (player === COMPUTER_PLAYER) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove].index !== undefined ? moves[bestMove].index : moves[bestMove].score;
};

const handleComputerMove = () => {
    if (!isGameActive || currentPlayer !== COMPUTER_PLAYER) return;

    const bestSpot = minimax(board, COMPUTER_PLAYER);
    
    if (bestSpot !== undefined) {
        makeMove(bestSpot, COMPUTER_PLAYER);
        handleResultValidation();
    }
};

document.getElementById('mode-pvp').addEventListener('click', () => {
    gameMode = 'pvp';
    initializeGame(HUMAN_PLAYER);
});

document.getElementById('mode-pvc').addEventListener('click', () => {
    gameMode = 'pvc';
    setScreen('turn');
});

document.getElementById('turn-player').addEventListener('click', () => {
    initializeGame(HUMAN_PLAYER);
});

document.getElementById('turn-computer').addEventListener('click', () => {
    initializeGame(COMPUTER_PLAYER);
});

restartButton.addEventListener('click', () => {
    if (gameMode === 'pvp') {
        initializeGame(HUMAN_PLAYER);
    } else {
        setScreen('turn');
    }
});

document.getElementById('back-button-turn').addEventListener('click', () => {
    setScreen('mode');
});

document.getElementById('back-button-game').addEventListener('click', () => {
    setScreen('mode');
});

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

setScreen('mode');