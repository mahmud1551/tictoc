class TicTacToe {
    constructor() {
        this.gameMode = '';
        this.currentPlayer = 'X';
        this.board = Array(9).fill('');
        this.scores = { X: 0, O: 0 };
        this.gameActive = false;
        this.playerNames = { X: 'Player 1', O: 'Player 2' };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Screens
        this.modeSelection = document.getElementById('modeSelection');
        this.playerInput = document.getElementById('playerInput');
        this.gameContainer = document.getElementById('gameContainer');
        this.winModal = document.getElementById('winModal');
        
        // Game elements
        this.board = document.getElementById('board');
        this.cells = document.querySelectorAll('.cell');
        
        // Buttons
        this.modeBtns = document.querySelectorAll('[data-mode]');
        this.startBtn = document.querySelector('.start-btn');
        this.restartBtn = document.querySelector('.restart-btn');
        this.newGameBtn = document.querySelector('.new-game-btn');
        this.playAgainBtn = document.querySelector('.play-again-btn');
        this.returnMenuBtn = document.querySelector('.return-menu-btn');
        
        // Player inputs
        this.player1Input = document.getElementById('player1');
        this.player2Input = document.getElementById('player2');
    }

    setupEventListeners() {
        // Mode selection
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectMode(btn.dataset.mode));
        });

        // Game start
        this.startBtn.addEventListener('click', () => this.startGame());

        // Game controls
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.newGameBtn.addEventListener('click', () => this.showModeSelection());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.returnMenuBtn.addEventListener('click', () => this.showModeSelection());
    }

    selectMode(mode) {
        this.gameMode = mode;
        this.modeSelection.style.display = 'none';
        
        if (mode === 'ai') {
            this.player2Input.value = 'AI';
            this.player2Input.disabled = true;
        } else {
            this.player2Input.value = '';
            this.player2Input.disabled = false;
        }
        
        this.playerInput.style.display = 'block';
    }

    startGame() {
        const player1Name = this.player1Input.value.trim() || 'Player 1';
        const player2Name = this.player2Input.value.trim() || (this.gameMode === 'ai' ? 'AI' : 'Player 2');

        this.playerNames = {
            X: player1Name,
            O: player2Name
        };

        this.updateScoreDisplay();
        this.playerInput.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.board = Array(9).fill('');
        this.updateBoard();
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = cell.dataset.index;
        if (this.board[index] !== '') return;

        this.makeMove(index);

        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateBoard();

        if (this.checkWin()) {
            this.handleWin();
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    makeAIMove() {
        const bestMove = this.minimax(this.board, 'O').index;
        this.makeMove(bestMove);
    }

    minimax(board, player) {
        const availableSpots = this.getEmptyCells(board);

        if (this.checkWinningCondition(board, 'X')) {
            return { score: -10 };
        } else if (this.checkWinningCondition(board, 'O')) {
            return { score: 10 };
        } else if (availableSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableSpots.length; i++) {
            const move = {};
            move.index = availableSpots[i];
            board[availableSpots[i]] = player;

            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }

            board[availableSpots[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
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

        return moves[bestMove];
    }

    getEmptyCells(board) {
        return board.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
    }

    checkWin() {
        return this.winningCombinations.some(combination => {
            return combination.every(index => {
                return this.board[index] === this.currentPlayer;
            });
        });
    }

    checkWinningCondition(board, player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => {
                return board[index] === player;
            });
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScoreDisplay();
        this.showWinModal(`${this.playerNames[this.currentPlayer]} wins!`);
    }

    handleDraw() {
        this.gameActive = false;
        this.showWinModal("It's a draw!");
    }

    updateBoard() {
        this.cells.forEach((cell, index) => {
            cell.className = 'cell';
            if (this.board[index]) {
                cell.classList.add(this.board[index].toLowerCase());
                cell.textContent = this.board[index];
            } else {
                cell.textContent = '';
            }
        });
    }

    updateScoreDisplay() {
        document.querySelector('.player1 .player-name').textContent = this.playerNames.X;
        document.querySelector('.player2 .player-name').textContent = this.playerNames.O;
        document.querySelector('.player1 .score').textContent = this.scores.X;
        document.querySelector('.player2 .score').textContent = this.scores.O;
    }

    showWinModal(message) {
        document.querySelector('.win-message').textContent = message;
        this.winModal.classList.add('active');
    }

    hideWinModal() {
        this.winModal.classList.remove('active');
    }

    restartGame() {
        this.hideWinModal();
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateBoard();
    }

    showModeSelection() {
        this.hideWinModal();
        this.gameContainer.style.display = 'none';
        this.modeSelection.style.display = 'block';
        this.scores = { X: 0, O: 0 };
        this.updateScoreDisplay();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
