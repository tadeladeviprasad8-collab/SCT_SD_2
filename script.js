window.onerror = (msg, url, line, col, error) => {
    console.error(`Global error: ${msg} at ${url}:${line}:${col}`, error);
    document.body.innerHTML = '<p style="color: red; text-align: center;">Game crashed! Please refresh and share console errors (F12).</p>';
};

document.addEventListener('DOMContentLoaded', () => {
    try {
console.log('Game initializing...');

                // DOM Elements
                const elements = {
                    guessInput: document.getElementById('guessInput'),
                    guessButton: document.getElementById('guessButton'),
                    hintButton: document.getElementById('hintButton'),
                    diamondHintButton: document.getElementById('diamondHintButton'),
                    startButton: document.getElementById('startButton'),
                    shopIcon: document.getElementById('shopIcon'),
                    pauseButton: document.getElementById('pauseButton'),
                    resumeButton: document.getElementById('resumeButton'),
                    restartButton: document.getElementById('restartButton'),
                    muteButton: document.getElementById('muteButton'),
                    themeSelect: document.getElementById('themeSelect'),
                    gameStatus: document.getElementById('gameStatus'),
                    hintDisplay: document.getElementById('hintDisplay'),
                    scoreDisplay: document.getElementById('scoreDisplay'),
                    diamondDisplay: document.getElementById('diamondDisplay'),
                    coinDisplay: document.getElementById('coinDisplay'),
                    levelDisplay: document.getElementById('levelDisplay'),
                    rangeDisplay: document.getElementById('rangeDisplay'),
                    timerDisplay: document.getElementById('timerDisplay'),
                    confettiCanvas: document.getElementById('confettiCanvas'),
                    shopModal: document.getElementById('shopModal'),
                    shopContent: document.getElementById('shopContent'),
                    closeShop: document.getElementById('closeShop'),
                    pauseMenu: document.getElementById('pauseMenu'),
                    backgroundMusic: document.getElementById('backgroundMusic'),
                    coinSound: document.getElementById('coinSound'),
                    hintSound: document.getElementById('hintSound')
                };

                // Validate DOM Elements
                for (const [key, element] of Object.entries(elements)) {
                    if (!element) {
                        console.error(`Element ${key} not found`);
                        document.body.innerHTML = '<p style="color: red; text-align: center;">Error loading game. Please refresh.</p>';
                        return;
                    }
                }

                // Game State
                const ctx = elements.confettiCanvas.getContext('2d');
                let secretNumber, score = 0, highScore = parseInt(localStorage.getItem('highScore')) || 0, level = 1, attempts = 0, diamonds = 0, coins = 0;
                let freeHints = 5, usedHints = [], maxAttempts = 10, timer, timeLeft = 30, maxNumber = 100;
                let isMuted = false, isPaused = false, firstInteraction = false, gameStarted = false;

                // Themes
                const themes = [
                    { id: 0, name: 'Paradise', url: 'https://i.pinimg.com/736x/78/24/92/7824927b7563d61ef4530fc0923ca7e4.jpg', unlocked: true, cost: 0, currency: 'coins' },
                    { id: 1, name: 'Butterfly Meadow', url: 'https://i.pinimg.com/736x/9a/af/54/9aaf5491e3ec7d14bbcc3efad9f5de7b.jpg', unlocked: false, cost: 50, currency: 'coins' },
                    { id: 2, name: 'Moonlight', url: 'https://i.pinimg.com/736x/0a/ea/7c/0aea7c16cac9a813a6e2db1829eea9f8.jpg', unlocked: false, cost: 50, currency: 'coins' },
                    { id: 3, name: 'Tulips', url: 'https://i.pinimg.com/736x/e7/43/1b/e7431b51b9cab352ea8ba68d586a7ae4.jpg', unlocked: false, cost: 50, currency: 'coins' },
                    { id: 4, name: 'Flowers', url: 'https://i.pinimg.com/736x/33/ba/e1/33bae14f4d11c67911261ee49a9e5756.jpg', unlocked: false, cost: 50, currency: 'coins' },
                    { id: 5, name: 'Beach', url: 'https://i.pinimg.com/736x/26/f2/d8/26f2d8572c2fe63a8180e945521874e3.jpg', unlocked: false, cost: 10, currency: 'diamonds' },
                    { id: 6, name: 'London', url: 'https://i.pinimg.com/736x/63/6e/73/636e731bc5067ebaa43a9854effc2a30.jpg', unlocked: false, cost: 10, currency: 'diamonds' },
                    { id: 7, name: 'Snow', url: 'https://i.pinimg.com/736x/9b/61/6a/9b616ac6d67dabe77866a3389b49a3de.jpg', unlocked: false, cost: 10, currency: 'diamonds' },
                    { id: 8, name: 'Castle', url: 'https://i.pinimg.com/736x/fe/b2/d0/feb2d0347176662154d4cc2ab7d46088.jpg', unlocked: false, cost: 10, currency: 'diamonds' },
                    { id: 9, name: 'Paris', url: 'https://i.pinimg.com/736x/37/46/00/37460024f2f5319ae9d17bf1603b8344.jpg', unlocked: false, cost: 10, currency: 'diamonds' }
                ];

                // Confetti
                // Confetti burst for correct guess, stops on Next Level
                let confettiInterval = null;
                function launchConfettiBurst() {
                    // Clear any previous confetti
                    if (confettiInterval) {
                        clearInterval(confettiInterval);
                        confettiInterval = null;
                    }
                    var duration = 15 * 1000;
                    var animationEnd = Date.now() + duration;
                    var defaults = {
                        startVelocity: 50,
                        spread: 360,
                        ticks: 80,
                        zIndex: 100,
                        scalar: 1.4,
                        colors: [
                            '#FFD700', // gold
                            '#FF69B4', // hot pink
                            '#00FFCC', // aqua
                            '#FF4500', // orange-red
                            '#00C4B4', // teal
                            '#FFFFFF', // white
                            '#FF0000', // red
                            '#00FF00', // lime
                            '#0000FF', // blue
                            '#FFA500'  // orange
                        ]
                    };

                    function randomInRange(min, max) {
                        return Math.random() * (max - min) + min;
                    }

                    confettiInterval = setInterval(function() {
                        var timeLeft = animationEnd - Date.now();
                        if (timeLeft <= 0) {
                            clearInterval(confettiInterval);
                            confettiInterval = null;
                            return;
                        }
                        var particleCount = 60 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                    }, 250);
                }

                // Stop confetti when Next Level or Restart is clicked
                function stopConfettiBurst() {
                    if (confettiInterval) {
                        clearInterval(confettiInterval);
                        confettiInterval = null;
                    }
                }

                // Hints
                const hintTypes = [
                    { type: 'oddEven', getHint: num => `The number is ${num % 2 === 0 ? 'even' : 'odd'}.` },
                    { type: 'range', getHint: num => {
                        const lower = Math.floor(num / 10) * 10;
                        const upper = lower + 10;
                        return `The number is between ${lower} and ${upper}.`;
                    }},
                    { type: 'multiple', getHint: num => {
                        if (num % 5 === 0) return `The number is a multiple of 5.`;
                        if (num % 3 === 0) return `The number is a multiple of 3.`;
                        if (num % 2 === 0) return `The number is a multiple of 2.`;
                        return `The number is not a multiple of 2, 3, or 5.`;
                    }},
                    { type: 'digitSum', getHint: num => {
                        const sum = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                        return `The sum of the digits is ${sum}.`;
                    }},
                    { type: 'trivia', getHint: num => {
                        const trivia = [
                            { number: 14, hint: "Close to the number of seasons in 'Supernatural'." },
                            { number: 7, hint: "Matches the number of Harry Potter books." },
                            { number: 23, hint: "Michael Jordan's jersey number." },
                            { number: 12, hint: "Number of months in a year." },
                            { number: 50, hint: "Number of U.S. states." }
                        ];
                        const match = trivia.find(t => t.number === num);
                        return match ? match.hint : `The number is ${num < 50 ? 'less' : 'greater'} than 50.`;
                    }}
                ];

                // Diamond Hints: Fun trivia and pop culture references for special hints
                // Format: { number: <number>, hint: <string> }
                const diamondHints = [
   { "number": 1, "hint": "How many rings rule them all in 'The Lord of the Rings?" },
  { "number": 2, "hint": "It takes how many people to tango… or fall in love?" },
  { "number": 3, "hint": "How many books in 'The Lord of the Rings' trilogy?" },
  { "number": 4, "hint": "How many seasons of 'Stranger Things' by 2025?" },
  { "number": 5, "hint": "How many seasons does 'Breaking Bad' have?" },
  { "number": 6, "hint": "How many core friends are there in the sitcom F.R.I.E.N.D.S?" },
  { "number": 7, "hint": "How many seasons does 'Game of Thrones' have?" },
  { "number": 8, "hint": "How many planets in our solar system?" },
  { "number": 9, "hint": "How many seasons does 'The Office' (US) have?" },
  { "number": 10, "hint": "How many seasons does 'Friends' have?" },
  { "number": 11, "hint": "How many seasons of 'The Simpsons' by 1999?" },
  { "number": 12, "hint": "How many seasons does 'The Big Bang Theory' have?" },
  { "number": 13, "hint": "Known as an unlucky number" },
  { "number": 14, "hint": "How many seasons does 'Supernatural' have?" },
  { "number": 15, "hint": "How many players on a rugby union team? 🏉" },
  { "number": 16, "hint": "How many seasons of 'Grey's Anatomy' by 2020?" },
  { "number": 17, "hint": "At what age can wizards use magic outside school in Harry Potter?" },
  { "number": 18, "hint": "How many holes in a standard golf course?" },
  { "number": 19, "hint": "What is the 8th prime number?" },
  { "number": 20, "hint": "How many sides does an icosagon have?" },
  { "number": 21, "hint": "What’s 7 x 3?" },
  { "number": 22, "hint": "What is the 8th prime number?" },
  { "number": 23, "hint": "How old was Miley Cyrus when ‘Hannah Montana’ first aired?" },
  { "number": 24, "hint": "How many hours in a day, like the show '24'?" },
  { "number": 25, "hint": "How many episodes in the first season of 'Lost'?" },
  { "number": 26, "hint": "How many seasons of 'South Park' by 2023?" },
  { "number": 27, "hint": "How many amendments in the U.S. Constitution?" },
  { "number": 28, "hint": "How many episodes in the first two seasons of 'The Crown'?" },
  { "number": 29, "hint": "How many days in February during a leap year?" },
  { "number": 30, "hint": "How many seasons of 'Law & Order' by 2010?" },
  { "number": 31, "hint": "How many flavors does Baskin-Robbins offer?" },
  { "number": 32, "hint": "How many bits in a standard IPv4 address?" },
  { "number": 33, "hint": "At what age was Jesus believed to be crucified?" },
  { "number": 34, "hint": "How many playable characters in 'Mario Kart: Double Dash!!?" },
  { "number": 35, "hint": "How many questions in a typical BuzzFeed quiz?" },
  { "number": 36, "hint": "How many black keys on a standard piano?" },
  { "number": 37, "hint": "What’s the average human body temperature (Celsius)?" },
  { "number": 38, "hint": "How many episodes are there in the anime 'Death Note?" },
  { "number": 39, "hint": "What’s the age limit to be U.S. President?" },
  { "number": 40, "hint": "How many episodes in the first two seasons of 'The Walking Dead'?" },
  { "number": 41, "hint": "Atomic number of niobium?" },
{ "number": 42, "hint": "The Answer to Life, The Universe, and Everything in 'Hitchhiker’s Guide'?" },
{ "number": 43, "hint": "Atomic number of Technetium (cool flex fact!)?" },
{ "number": 44, "hint": "How many U.S. presidents have there been as of 2025?" },
{ "number": 45, "hint": "What's 15 + 30?" },
{ "number": 46, "hint": "How many chromosomes in a human cell (excluding sex chromosomes)?" },
{ "number": 47, "hint": "Atomic number of silver?" },
{ "number": 48, "hint": "How many contiguous U.S. states?" },
{ "number": 49, "hint": "What's 7 squared?" },
{ "number": 50, "hint": "How many states in the United States?" },
{ "number": 51, "hint": "Area 51: What’s the number of the top-secret base?" },
{ "number": 52, "hint": "How many cards in a standard deck (no jokers)?" },
{ "number": 53, "hint": "Atomic number of iodine?" },
{ "number": 54, "hint": "How many countries in Africa (UN-recognized)?" },
{ "number": 55, "hint": "Speed limit of many US highways (mph)?" },
{ "number": 56, "hint": "Atomic number of barium?" },
{ "number": 57, "hint": "How many varieties of Heinz sauces?" },
{ "number": 58, "hint": "Atomic number of cerium?" },
{ "number": 59, "hint": "Seconds in 59 seconds?" },
{ "number": 60, "hint": "Minutes in an hour?" },
{ "number": 61, "hint": "International dialing code for Australia?" },
{ "number": 62, "hint": "Atomic number of samarium?" },
{ "number": 63, "hint": "What’s the ASCII code for ‘?’" },
{ "number": 64, "hint": "How many squares on a chessboard?" },
{ "number": 65, "hint": "ASCII code for capital 'A'?" },
{ "number": 66, "hint": "Order 66 in Star Wars: What’s the number?" },
{ "number": 67, "hint": "Atomic number of holmium?" },
{ "number": 68, "hint": "What's 34 × 2?" },
{ "number": 69, "hint": "Atomic number of thulium?" },
{ "number": 70, "hint": "How many years in a platinum jubilee?" },
{ "number": 71, "hint": "International dialing code for Syria?" },
{ "number": 72, "hint": "How many demons in Ars Goetia? (goth-core 💀)" },
{ "number": 73, "hint": "Atomic number of tantalum?" },
{ "number": 74, "hint": "International dialing code for Germany?" },
{ "number": 75, "hint": "How many years in a diamond jubilee?" },
{ "number": 76, "hint": "How many trombones led the big parade (song ref)?" },
{ "number": 77, "hint": "Atomic number of iridium?" },
{ "number": 78, "hint": "How many cards in a Tarot deck?" },
{ "number": 79, "hint": "Atomic number of gold?" },
{ "number": 80, "hint": "Cents in four U.S. quarters?" },
{ "number": 81, "hint": "What’s 9×9?" },
{ "number": 82, "hint": "Games per NBA team in regular season?" },
{ "number": 83, "hint": "Atomic number of bismuth?" },
{ "number": 84, "hint": "Last two digits of the year in Orwell's '1984'?" },
{ "number": 85, "hint": "Atomic number of astatine?" },
{ "number": 86, "hint": "'I got 86’d' — what number?" },
{ "number": 87, "hint": "International dialing code for Indonesia?" },
{ "number": 88, "hint": "How many keys on a full piano keyboard?" },
{ "number": 89, "hint": "Atomic number of actinium?" },
{ "number": 90, "hint": "Degrees in a right angle?" },
{ "number": 91, "hint": "Atomic number of Protactinium?" },
{ "number": 92, "hint": "Atomic number of uranium?" },
{ "number": 93, "hint": "International dialing code for Portugal?" },
{ "number": 94, "hint": "Atomic number of plutonium?" },
{ "number": 95, "hint": "How many theses did Martin Luther write?" },
{ "number": 96, "hint": "Months in 8 years?" },
{ "number": 97, "hint": "International dialing code for Mongolia?" },
{ "number": 98, "hint": "Atomic number of californium?" },
{ "number": 99, "hint": "How many problems did Jay-Z have?" },
{ "number": 100, "hint": "How many years in a century?" },
    // --- Special/Bonus Numbers ---
    { number: 101, hint: "How many Dalmatians in the Disney story?" },
    { number: 200, hint: "Approximate years of the Roman Empire at its peak?" },
    { number: 365, hint: "How many days in a non-leap year?" },
    { number: 500, hint: "Perfect score in bowling?" },
    { number: 1000, hint: "How many years in a millennium?" }
                ];

                // Initialize Game
                function initializeGame() {
                    try {
                        console.log('Initializing pre-game state...');
                        gameStarted = false;
                        elements.guessInput.style.display = 'none';
                        elements.guessButton.style.display = 'none';
                        elements.hintButton.style.display = 'none';
                        elements.diamondHintButton.style.display = 'none';
                        elements.pauseButton.style.display = 'none';
                        elements.startButton.style.display = 'inline-block';
                        elements.startButton.textContent = 'Start Game';
                        elements.gameStatus.textContent = 'Click Start Game to begin!';
                        elements.timerDisplay.textContent = '';
                        clearInterval(timer);
                        updateDisplays();
                    } catch (e) {
                        console.error('initializeGame error:', e);
                        elements.gameStatus.textContent = 'Error initializing game.';
                    }
                }

                // Start Game
                function startGame() {
                    try {
                        stopConfettiBurst(); // Stop confetti immediately when starting next level or restarting
                        console.log('Starting game...');
                        gameStarted = true;
                        maxNumber = level <= 50 ? 100 : 1000;
                        secretNumber = Math.floor(Math.random() * maxNumber) + 1;
                        console.log('Secret number:', secretNumber);
                        attempts = 0;
                        freeHints = 5;
                        usedHints = [];
                        elements.guessInput.value = '';
                        elements.guessInput.disabled = false;
                        elements.guessInput.readOnly = false;
                        elements.guessInput.focus();
                        elements.guessInput.max = maxNumber;
                        elements.guessButton.classList.remove('disabled');
                        elements.hintButton.classList.remove('disabled');
                        elements.diamondHintButton.classList.remove('disabled');
                        elements.guessInput.style.display = 'block';
                        elements.guessButton.style.display = 'inline-block';
                        elements.hintButton.style.display = 'inline-block';
                        elements.diamondHintButton.style.display = diamonds > 0 && level > 1 ? 'inline-block' : 'none';
                        elements.pauseButton.style.display = 'inline-block';
                        elements.startButton.style.display = 'none';
                        elements.gameStatus.textContent = 'Guess a number!';
                        elements.hintDisplay.textContent = '';
                        elements.rangeDisplay.textContent = `Range: 1 to ${maxNumber}`;
                        elements.confettiCanvas.width = window.innerWidth;
                        elements.confettiCanvas.height = window.innerHeight;
                        isPaused = false;
                        console.log('Buttons reset');
                        startTimer();
                        updateDisplays();
                        if (firstInteraction && !isMuted) {
                            playAudio(elements.backgroundMusic);
                        }
                    } catch (e) {
                        console.error('startGame error:', e);
                        elements.gameStatus.textContent = 'Error starting game.';
                    }
                }

                // Start Timer
                function startTimer() {
                    try {
                        console.log('Starting timer...');
                        clearInterval(timer);
                        timeLeft = 30;
                        elements.timerDisplay.textContent = `Time Left: ${timeLeft}s`;
                        elements.timerDisplay.classList.remove('warning');
                        timer = setInterval(() => {
                            if (!isPaused && gameStarted) {
                                timeLeft--;
                                elements.timerDisplay.textContent = `Time Left: ${timeLeft}s`;
                                if (timeLeft <= 5) elements.timerDisplay.classList.add('warning');
                                if (timeLeft <= 0) endGame(`Time's up! The number was ${secretNumber}.`);
                            }
                        }, 1000);
                    } catch (e) {
                        console.error('startTimer error:', e);
                    }
                }

                // Update Displays
                function updateDisplays() {
                    try {
                        console.log('Updating displays...');
                        elements.scoreDisplay.textContent = `Score: ${score}`;
                        elements.diamondDisplay.textContent = `Diamonds: ${diamonds} 💎`;
                        elements.coinDisplay.textContent = `Coins: ${coins} 🪙`;
                        elements.levelDisplay.textContent = `Level: ${level}`;
                        elements.hintButton.textContent = `Get Hint (${freeHints} Free)`;
                        elements.diamondHintButton.textContent = `Diamond Hint (${diamonds} Diamond${diamonds !== 1 ? 's' : ''})`;
                    } catch (e) {
                        console.error('updateDisplays error:', e);
                    }
                }

                // Play Audio
                function playAudio(audio) {
                    try {
                        if (!isMuted && firstInteraction) {
                            audio.play().catch(e => {
                                console.error('Audio play error:', e);
                            });
                        }
                    } catch (e) {
                        console.error('playAudio error:', e);
                    }
                }

                // Get Free Hint
                function getFreeHint() {
                    try {
                        console.log('Getting free hint... Free hints left:', freeHints);
                        if (freeHints > 0) {
                            let availableHints = hintTypes.filter(h => !usedHints.includes(h.type));
                            if (availableHints.length === 0) {
                                usedHints = [];
                                availableHints = [...hintTypes];
                            }
                            const hint = availableHints[Math.floor(Math.random() * availableHints.length)];
                            usedHints.push(hint.type);
                            elements.hintDisplay.textContent = hint.getHint(secretNumber);
                            console.log('Hint type:', hint.type);
                            freeHints--;
                            startTimer();
                            updateDisplays();
                            playAudio(elements.hintSound);
                        } else {
                            elements.hintDisplay.textContent = 'No free hints left!';
                        }
                    } catch (e) {
                        console.error('getFreeHint error:', e);
                        elements.hintDisplay.textContent = 'Error getting hint.';
                    }
                }

                // Get Diamond Hint
                function getDiamondHint() {
                    try {
                        console.log('Getting diamond hint... Diamonds:', diamonds);
                        if (diamonds > 0 && level > 1) {
                            diamonds--;
                            const match = diamondHints.find(h => h.number === secretNumber) || {
                                hint: `The number is close to the number of episodes in Game of Thrones plus ${secretNumber - 73}.`
                            };
                            elements.hintDisplay.textContent = match.hint;
                            startTimer();
                            updateDisplays();
                            playAudio(elements.hintSound);
                        } else {
                            elements.hintDisplay.textContent = diamonds === 0 ? 'No diamonds left!' : 'Diamond hints available from Level 2!';
                        }
                    } catch (e) {
                        console.error('getDiamondHint error:', e);
                        elements.hintDisplay.textContent = 'Error getting diamond hint.';
                    }
                }

                // Check Guess
                function checkGuess() {
                    try {
                        const guess = parseInt(elements.guessInput.value);
                        console.log('Guess submitted:', guess);
                        attempts++;
                        if (isNaN(guess) || guess < 1 || guess > maxNumber) {
                            elements.gameStatus.textContent = `Please enter a number between 1 and ${maxNumber}!`;
                            console.log('Invalid guess:', guess);
                            return;
                        }
                        startTimer();
                        if (guess === secretNumber) {
                            score++;
                            diamonds++;
                            coins += 10;
                            if (score > highScore) {
                                highScore = score;
                                localStorage.setItem('highScore', highScore);
                            }
                            elements.gameStatus.textContent = `Correct! You guessed it in ${attempts} attempts! 🎉`;
                            console.log('Correct guess! Score:', score);
                            launchConfettiBurst();
                            playAudio(elements.coinSound);
                            endLevel();
                        } else if (guess < secretNumber) {
                            elements.gameStatus.textContent = 'Too low! Try again.';
                        } else {
                            elements.gameStatus.textContent = 'Too high! Try again.';
                        }
                        if (attempts >= maxAttempts) {
                            endGame(`Game over! Out of attempts! The number was ${secretNumber}.`);
                        }
                        updateDisplays();
                    } catch (e) {
                        console.error('checkGuess error:', e);
                        elements.gameStatus.textContent = 'Error checking guess.';
                    }
                }

                // End Level
                function endLevel() {
                    try {
                        console.log('Ending level... Level:', level);
                        clearInterval(timer);
                        elements.guessInput.disabled = true;
                        elements.guessButton.classList.add('disabled');
                        elements.hintButton.classList.add('disabled');
                        elements.diamondHintButton.classList.add('disabled');
                        elements.startButton.style.display = 'inline-block';
                        elements.startButton.textContent = 'Next Level';
                        level++;
                        updateDisplays();
                    } catch (e) {
                        console.error('endLevel error:', e);
                    }
                }

                // End Game
                function endGame(message) {
                    try {
                        console.log('Ending game:', message);
                        clearInterval(timer);
                        elements.gameStatus.textContent = message;
                        elements.guessInput.disabled = true;
                        elements.guessButton.classList.add('disabled');
                        elements.hintButton.classList.add('disabled');
                        elements.diamondHintButton.classList.add('disabled');
                        elements.startButton.style.display = 'inline-block';
                        elements.startButton.textContent = 'Restart Game';
                        gameStarted = false;
                        updateDisplays();
                    } catch (e) {
                        console.error('endGame error:', e);
                        elements.gameStatus.textContent = 'Error ending game.';
                    }
                }

                // Toggle Pause
                function togglePause() {
                    try {
                        console.log('Toggling pause... Current state:', isPaused);
                        isPaused = !isPaused;
                        elements.pauseMenu.style.display = isPaused ? 'block' : 'none';
                        elements.guessInput.disabled = isPaused;
                        elements.guessButton.classList.toggle('disabled', isPaused);
                        elements.hintButton.classList.toggle('disabled', isPaused);
                        elements.diamondHintButton.classList.toggle('disabled', isPaused);
                        if (isPaused) {
                            clearInterval(timer);
                            elements.backgroundMusic.pause();
                        } else {
                            startTimer();
                            playAudio(elements.backgroundMusic);
                        }
                    } catch (e) {
                        console.error('togglePause error:', e);
                    }
                }

                // Toggle Mute
                function toggleMute() {
                    try {
                        console.log('Toggling mute... Current state:', isMuted);
                        isMuted = !isMuted;
                        elements.muteButton.textContent = isMuted ? 'Unmute 🔊' : 'Mute 🔇';
                        if (isMuted) {
                            elements.backgroundMusic.pause();
                        } else {
                            playAudio(elements.backgroundMusic);
                        }
                    } catch (e) {
                        console.error('toggleMute error:', e);
                    }
                }

                // Update Theme Select
                function updateThemeSelect() {
                    try {
                        console.log('Updating theme select...');
                        elements.themeSelect.innerHTML = '';
                        themes.filter(t => t.unlocked).forEach(t => {
                            const option = document.createElement('option');
                            option.value = t.id;
                            option.textContent = t.name;
                            elements.themeSelect.appendChild(option);
                        });
                        changeTheme(elements.themeSelect.value);
                    } catch (e) {
                        console.error('updateThemeSelect error:', e);
                    }
                }

                // Change Theme
                function changeTheme(id) {
                    try {
                        console.log('Changing theme to ID:', id);
                        const theme = themes.find(t => t.id == id);
                        if (theme) {
                            const img = new Image();
                            img.src = theme.url;
                            img.onerror = () => console.error(`Failed to load theme image: ${theme.url}`);
                            document.body.style.backgroundImage = `url('${theme.url}')`;
                        }
                    } catch (e) {
                        console.error('changeTheme error:', e);
                    }
                }

                // Open Shop
                function openShop() {
                    try {
                        console.log('Opening shop...');
                        elements.shopModal.style.display = 'block';
                        elements.shopContent.innerHTML = '';
                        themes.forEach(t => {
                            const div = document.createElement('div');
                            const img = document.createElement('img');
                            img.src = t.url;
                            img.alt = t.name;
                            img.onerror = () => console.error(`Shop image failed: ${t.url}`);
                            const status = document.createElement('p');
                            if (t.unlocked) {
                                status.textContent = 'Unlocked';
                            } else {
                                status.textContent = `Cost: ${t.cost} ${t.currency === 'coins' ? '🪙' : '💎'}`;
                                const buyButton = document.createElement('button');
                                buyButton.textContent = 'Buy';
                                buyButton.addEventListener('click', () => buyTheme(t));
                                div.appendChild(buyButton);
                            }
                            div.appendChild(img);
                            div.appendChild(status);
                            elements.shopContent.appendChild(div);
                        });
                    } catch (e) {
                        console.error('openShop error:', e);
                    }
                }

                // Buy Theme
                function buyTheme(t) {
                    try {
                        console.log('Buying theme:', t.name);
                        if (t.currency === 'coins' && coins >= t.cost && !t.unlocked) {
                            coins -= t.cost;
                            t.unlocked = true;
                        } else if (t.currency === 'diamonds' && diamonds >= t.cost && !t.unlocked) {
                            diamonds -= t.cost;
                            t.unlocked = true;
                        } else {
                            alert(t.unlocked ? 'Already unlocked!' : `Not enough ${t.currency}!`);
                            return;
                        }
                        updateDisplays();
                        updateThemeSelect();
                        openShop();
                    } catch (e) {
                        console.error('buyTheme error:', e);
                    }
                }

                // Setup Event Listeners
                function setupEventListeners() {
                    try {
                        console.log('Setting up event listeners...');
                        elements.guessInput.addEventListener('input', () => console.log('Typing in guessInput:', elements.guessInput.value));
                        elements.guessButton.addEventListener('click', () => {
                            console.log('Guess button clicked');
                            checkGuess();
                        });
                        elements.hintButton.addEventListener('click', () => {
                            console.log('Hint button clicked');
                            getFreeHint();
                        });
                        elements.diamondHintButton.addEventListener('click', () => {
                            console.log('Diamond hint button clicked');
                            getDiamondHint();
                        });
                        elements.startButton.addEventListener('click', () => {
                            console.log('Start button clicked');
                            startGame();
                        });
                        elements.shopIcon.addEventListener('click', () => {
                            console.log('Shop icon clicked');
                            openShop();
                        });
                        elements.closeShop.addEventListener('click', () => {
                            console.log('Close shop clicked');
                            elements.shopModal.style.display = 'none';
                        });
                        elements.pauseButton.addEventListener('click', () => {
                            console.log('Pause button clicked');
                            togglePause();
                        });
                        elements.resumeButton.addEventListener('click', () => {
                            console.log('Resume button clicked');
                            togglePause();
                        });
                        elements.restartButton.addEventListener('click', () => {
                            console.log('Restart button clicked');
                            togglePause();
                            startGame();
                        });
                        elements.muteButton.addEventListener('click', () => {
                            console.log('Mute button clicked');
                            toggleMute();
                        });
                        elements.themeSelect.addEventListener('change', () => {
                            console.log('Theme selected:', elements.themeSelect.value);
                            changeTheme(elements.themeSelect.value);
                        });
                        elements.guessInput.addEventListener('keypress', e => {
                            if (e.key === 'Enter') {
                                console.log('Enter key pressed');
                                checkGuess();
                            }
                        });
                        document.addEventListener('click', e => {
                            if (!elements.pauseMenu.contains(e.target) && !elements.pauseButton.contains(e.target) && isPaused) {
                                console.log('Outside click to close pause menu');
                                togglePause();
                            }
                        });
                        window.addEventListener('resize', () => {
                            console.log('Window resized');
                            elements.confettiCanvas.width = window.innerWidth;
                            elements.confettiCanvas.height = window.innerHeight;
                        });
                        const unlockAudio = () => {
                            console.log('Unlocking audio...');
                            if (!firstInteraction) {
                                firstInteraction = true;
                                playAudio(elements.backgroundMusic);
                            }
                        };
                        document.addEventListener('click', unlockAudio, { once: true });
                        document.addEventListener('touchstart', unlockAudio, { once: true });
                        elements.guessInput.addEventListener('input', unlockAudio, { once: true });
                    } catch (e) {
                        console.error('setupEventListeners error:', e);
                    }
                }

                // Initialize
                console.log('Game initialization starting...');
                setupEventListeners();
                updateThemeSelect();
                initializeGame();
                console.log('Game initialization complete');
            } catch (e) {
                console.error('Initialization error:', e);
                document.body.innerHTML = '<p style="color: red; text-align: center;">Error loading game. Please refresh.</p>';
            } 
        });
