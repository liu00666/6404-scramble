/**********************************************
 * Utility: Shuffle function
 **********************************************/
function shuffle(src) {
    const copy = [...src];
    const length = copy.length;
    for (let i = 0; i < length; i++) {
      const x = copy[i];
      const y = Math.floor(Math.random() * length);
      const z = copy[y];
      copy[i] = z;
      copy[y] = x;
    }
    return typeof src === 'string' ? copy.join('') : copy;
  }
  
  /**********************************************
   * Constants
   **********************************************/
  const WORDS = [
    'mockup', 'layout', 'design', 'canvas', 'pixels',
    'border', 'circle', 'shadow', 'button', 'vector'
  ];
  
  const MAX_STRIKES = 3;
  const MAX_PASSES = 3;
  
  /**********************************************
   * React Component
   **********************************************/
  function App() {
    const [words, setWords] = React.useState([]);
    const [currentWord, setCurrentWord] = React.useState('');
    const [scrambledWord, setScrambledWord] = React.useState('');
    const [guess, setGuess] = React.useState('');
    const [points, setPoints] = React.useState(0);
    const [strikes, setStrikes] = React.useState(0);
    const [passes, setPasses] = React.useState(MAX_PASSES);
    const [feedback, setFeedback] = React.useState('');
    const [gameOver, setGameOver] = React.useState(false);
  
    // Load saved game or start new
    React.useEffect(() => {
      const saved = JSON.parse(localStorage.getItem('gameState'));
      if (saved) {
        setWords(saved.words);
        setCurrentWord(saved.currentWord);
        setScrambledWord(saved.scrambledWord);
        setPoints(saved.points);
        setStrikes(saved.strikes);
        setPasses(saved.passes);
        setGameOver(saved.gameOver);
      } else {
        startNewGame();
      }
    }, []);
  
    // Save to localStorage on every change
    React.useEffect(() => {
      localStorage.setItem('gameState', JSON.stringify({
        words, currentWord, scrambledWord, points, strikes, passes, gameOver
      }));
    }, [words, currentWord, scrambledWord, points, strikes, passes, gameOver]);
  
    function startNewGame() {
      const shuffledWords = shuffle([...WORDS]);
      const word = shuffledWords[0];
      setWords(shuffledWords.slice(1));
      setCurrentWord(word);
      setScrambledWord(shuffle(word));
      setPoints(0);
      setStrikes(0);
      setPasses(MAX_PASSES);
      setGuess('');
      setFeedback('');
      setGameOver(false);
      localStorage.removeItem('gameState');
    }
  
    function handleGuessSubmit(e) {
      e.preventDefault();
      if (gameOver) return;
  
      if (guess.trim().toLowerCase() === currentWord.toLowerCase()) {
        const nextWords = [...words];
        const nextWord = nextWords.shift();
        setPoints(points + 1);
        setFeedback('✅ Correct!');
        setWords(nextWords);
  
        if (!nextWord) {
          setGameOver(true);
          setFeedback('🎉 You finished all the words!');
        } else {
          setCurrentWord(nextWord);
          setScrambledWord(shuffle(nextWord));
        }
      } else {
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);
        setFeedback('❌ Incorrect.');
        if (newStrikes >= MAX_STRIKES) {
          setGameOver(true);
          setFeedback('💥 Game Over!');
        }
      }
      setGuess('');
    }
  
    function handlePass() {
      if (passes <= 0 || gameOver) return;
  
      const nextWords = [...words];
      const nextWord = nextWords.shift();
      setPasses(passes - 1);
      setWords(nextWords);
      if (!nextWord) {
        setGameOver(true);
        setFeedback('🎉 You finished all the words!');
      } else {
        setCurrentWord(nextWord);
        setScrambledWord(shuffle(nextWord));
        setFeedback('🔁 Passed.');
      }
    }
  
    return (
      <div className="container">
        <h1>Scramble Game</h1>
        {gameOver ? (
          <>
            <p className="end-message">{feedback}</p>
            <p>🎯 Final Score: {points}</p>
            <button onClick={startNewGame}>🔄 Play Again</button>
          </>
        ) : (
          <>
            <div className="word-box">
              <p><strong>{scrambledWord}</strong></p>
            </div>
            <form onSubmit={handleGuessSubmit}>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Your guess"
                required
                autoFocus
              />
            </form>
            <button onClick={handlePass} disabled={passes <= 0}>
              Pass ({passes} left)
            </button>
            <div className="feedback">{feedback}</div>
            <div className="status">
              🏆 Points: {points} | ❌ Strikes: {strikes}/{MAX_STRIKES}
            </div>
          </>
        )}
      </div>
    );
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);