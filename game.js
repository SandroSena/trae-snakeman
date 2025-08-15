document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const scoreElement = document.getElementById('score');
    
    // Mobile control buttons
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 7;
    
    // Game state
    let gameRunning = false;
    let gameLoop;
    let score = 0;
    
    // Snake initial position and velocity
    let snake = [
        { x: 10, y: 10 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // Food initial position
    let food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Colors
    const snakeColor = '#4CAF50';
    const snakeHeadColor = '#388E3C';
    const foodColor = '#FF5722';
    const gridColor = '#e0e0e0';
    
    // Start/Restart game
    function startGame() {
        gameRunning = true;
        startBtn.textContent = 'Restart Game';
        
        // Reset game state
        snake = [{ x: 10, y: 10 }];
        velocityX = 1;
        velocityY = 0;
        score = 0;
        scoreElement.textContent = score;
        generateFood();
        
        // Clear previous game loop if exists
        if (gameLoop) clearInterval(gameLoop);
        
        // Start game loop
        gameLoop = setInterval(updateGame, 1000 / speed);
    }
    
    // Update game state
    function updateGame() {
        if (!gameRunning) return;
        
        // Move snake
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        
        // Check wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // Check self collision
        for (let i = 0; i < snake.length; i++) {
            if (i !== 0 && snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            generateFood();
            // Increase speed slightly every 5 points
            if (score % 5 === 0) {
                speed += 0.5;
                clearInterval(gameLoop);
                gameLoop = setInterval(updateGame, 1000 / speed);
            }
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
        
        // Draw everything
        drawGame();
    }
    
    // Draw game elements
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw food
        ctx.fillStyle = foodColor;
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Different color for head
            ctx.fillStyle = index === 0 ? snakeHeadColor : snakeColor;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Add a border to make segments distinct
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }
    
    // Draw grid lines
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    // Generate new food position
    function generateFood() {
        // Keep generating until we find a position not occupied by the snake
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Check if food is on snake
            for (let segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = newFood;
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        startBtn.textContent = 'Start Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent arrow keys from scrolling the page
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // Start game with space
        if (e.key === ' ' && !gameRunning) {
            startGame();
            return;
        }
        
        // Only change direction if game is running
        if (!gameRunning) return;
        
        // Prevent 180-degree turns
        switch (e.key) {
            case 'ArrowUp':
                if (velocityY !== 1) { // Not going down
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case 'ArrowDown':
                if (velocityY !== -1) { // Not going up
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
            case 'ArrowLeft':
                if (velocityX !== 1) { // Not going right
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case 'ArrowRight':
                if (velocityX !== -1) { // Not going left
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
        }
    });
    
    // Button controls
    startBtn.addEventListener('click', startGame);
    
    // Mobile controls
    upBtn.addEventListener('click', () => {
        if (gameRunning && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        }
    });
    
    downBtn.addEventListener('click', () => {
        if (gameRunning && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        }
    });
    
    leftBtn.addEventListener('click', () => {
        if (gameRunning && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        }
    });
    
    rightBtn.addEventListener('click', () => {
        if (gameRunning && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
    });
    
    // Initial draw
    drawGame();
});