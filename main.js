const { useState, useEffect, useRef, createElement: e } = React;

// Audio system
const AudioSystem = {
  context: null,
  
  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  playTone(frequency, duration, type = 'sine') {
    this.init();
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  },
  
  playSuccess() {
    this.playTone(523.25, 0.1);
    setTimeout(() => this.playTone(659.25, 0.15), 100);
  },
  
  playError() {
    this.playTone(200, 0.2, 'sawtooth');
  },
  
  playClick() {
    this.playTone(800, 0.05, 'square');
  },
  
  playVictory() {
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2), i * 150);
    });
  }
};

// CAPTCHA generators
const CaptchaGenerators = {
  distortedText() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const length = 6;
    const text = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    return {
      type: 'text',
      question: 'Enter the characters you see below',
      answer: text,
      data: { text }
    };
  },
  
  imageSelection() {
    const categories = [
      { name: 'bicycles', emoji: '🚲', decoys: ['🚗', '🚌', '🚕', '🚙', '✈️', '🚁', '⛵', '🚂'] },
      { name: 'traffic lights', emoji: '🚦', decoys: ['🚏', '⛽', '🏪', '🏢', '🏠', '🌳', '💡', '📱'] },
      { name: 'crosswalks', emoji: '🚶', decoys: ['🏃', '🚴', '🧍', '💃', '🕺', '🤸', '🧘', '🏋️'] },
      { name: 'trees', emoji: '🌲', decoys: ['🌵', '🌴', '🌻', '🌹', '🌷', '🍄', '🌿', '🌾'] }
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const correctCount = 3 + Math.floor(Math.random() * 2);
    const totalImages = 12;
    
    const images = [];
    for (let i = 0; i < correctCount; i++) {
      images.push({ emoji: category.emoji, correct: true, id: i });
    }
    
    for (let i = correctCount; i < totalImages; i++) {
      const decoy = category.decoys[Math.floor(Math.random() * category.decoys.length)];
      images.push({ emoji: decoy, correct: false, id: i });
    }
    
    // Shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
    
    return {
      type: 'image_grid',
      question: `Select all images with ${category.name}`,
      answer: images.filter(img => img.correct).map(img => img.id),
      data: { images, categoryName: category.name }
    };
  },
  
  arrowSequence() {
    const arrows = ['↑', '→', '↓', '←'];
    const length = 5;
    const sequence = Array.from({length}, () => arrows[Math.floor(Math.random() * arrows.length)]);

    return {
      type: 'arrows',
      question: 'Click the arrows in the order shown',
      answer: sequence,
      data: { sequence }
    };
  },

  sliderPuzzle() {
    const targetPosition = 70 + Math.floor(Math.random() * 10);
    
    return {
      type: 'slider',
      question: 'Slide to complete the puzzle',
      answer: targetPosition,
      data: { targetPosition, tolerance: 5 }
    };
  }
};

function generateRandomCaptchas() {
  const generators = [
    CaptchaGenerators.distortedText,
    CaptchaGenerators.imageSelection,
    CaptchaGenerators.arrowSequence,
    CaptchaGenerators.sliderPuzzle
  ];

  const shuffled = [...generators].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((gen, idx) => ({
    ...gen(),
    id: idx,
    startTime: null,
    endTime: null,
    errors: 0
  }));
}

// Distorted Text Component
function DistortedTextCaptcha({ data, onSubmit, onError }) {
  const canvasRef = useRef(null);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { text } = data;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    // Draw wavy lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const startY = Math.random() * canvas.height;
      ctx.moveTo(0, startY);
      for (let x = 0; x < canvas.width; x += 10) {
        ctx.lineTo(x, startY + Math.sin(x / 20 + i) * 20);
      }
      ctx.stroke();
    }
    
    // Draw text
    ctx.font = 'bold 48px Space Mono';
    ctx.textBaseline = 'middle';
    
    const spacing = 60;
    const startX = (canvas.width - (text.length * spacing)) / 2;
    
    text.split('').forEach((char, i) => {
      const x = startX + i * spacing;
      const y = canvas.height / 2;
      const rotation = (Math.random() - 0.5) * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
      ctx.fillText(char, 2, 2);
      
      // Main text
      ctx.fillStyle = '#00ff88';
      ctx.fillText(char, 0, 0);
      
      ctx.restore();
    });
  }, [data]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === data.text) {
      onSubmit();
    } else {
      onError();
      setInput('');
    }
  };
  
  return e('div', { className: 'captcha-container' },
    e('canvas', {
      ref: canvasRef,
      width: 400,
      height: 150,
      className: 'captcha-canvas'
    }),
    e('form', { onSubmit: handleSubmit, className: 'captcha-form' },
      e('input', {
        type: 'text',
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: 'Type the characters',
        className: 'captcha-input',
        autoFocus: true,
        autoComplete: 'off'
      }),
      e('button', {
        type: 'submit',
        className: 'btn-submit',
        onClick: () => AudioSystem.playClick()
      }, 'VERIFY')
    )
  );
}

// Image Grid Component
function ImageGridCaptcha({ data, onSubmit, onError }) {
  const [selected, setSelected] = useState(new Set());
  const { images, categoryName } = data;
  
  const toggleImage = (id) => {
    AudioSystem.playClick();
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };
  
  const handleSubmit = () => {
    const correctIds = new Set(images.filter(img => img.correct).map(img => img.id));
    const selectedArray = Array.from(selected);
    
    const isCorrect = selectedArray.length === correctIds.size &&
                      selectedArray.every(id => correctIds.has(id));
    
    if (isCorrect) {
      onSubmit();
    } else {
      onError();
      setSelected(new Set());
    }
  };
  
  return e('div', { className: 'captcha-container' },
    e('div', { className: 'image-grid' },
      images.map(img =>
        e('div', {
          key: img.id,
          className: `image-cell ${selected.has(img.id) ? 'selected' : ''}`,
          onClick: () => toggleImage(img.id)
        }, img.emoji)
      )
    ),
    e('button', {
      className: 'btn-submit',
      onClick: handleSubmit,
      disabled: selected.size === 0
    }, 'VERIFY')
  );
}

// Arrow Sequence Component
function ArrowSequenceCaptcha({ data, onSubmit, onError }) {
  const [userSequence, setUserSequence] = useState([]);
  const { sequence } = data;
  
  const handleArrowClick = (arrow) => {
    AudioSystem.playClick();
    const newSequence = [...userSequence, arrow];
    setUserSequence(newSequence);
    
    // Check if incorrect
    if (sequence[newSequence.length - 1] !== arrow) {
      onError();
      setUserSequence([]);
      return;
    }
    
    // Check if complete
    if (newSequence.length === sequence.length) {
      onSubmit();
    }
  };
  
  return e('div', { className: 'captcha-container' },
    e('div', { className: 'arrow-display' },
      sequence.map((arrow, i) =>
        e('span', {
          key: i,
          className: `arrow-symbol ${i < userSequence.length ? 'completed' : ''}`
        }, arrow)
      )
    ),
    e('div', { className: 'arrow-input' },
      ['↑', '→', '↓', '←'].map(arrow =>
        e('button', {
          key: arrow,
          className: 'arrow-btn',
          onClick: () => handleArrowClick(arrow)
        }, arrow)
      )
    )
  );
}

// Slider Puzzle Component
function SliderCaptcha({ data, onSubmit, onError }) {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { targetPosition, tolerance } = data;
  
  const handleSubmit = () => {
    if (Math.abs(position - targetPosition) <= tolerance) {
      onSubmit();
    } else {
      onError();
      setPosition(0);
    }
  };
  
  return e('div', { className: 'captcha-container' },
    e('div', { className: 'slider-container' },
      e('div', { className: 'slider-track' },
        e('div', {
          className: 'slider-target',
          style: { left: `${targetPosition}%` }
        }),
        e('div', {
          className: 'slider-piece',
          style: { left: `${position}%` }
        }, '🧩')
      ),
      e('input', {
        type: 'range',
        min: 0,
        max: 100,
        value: position,
        onChange: (e) => setPosition(Number(e.target.value)),
        className: 'slider-input'
      })
    ),
    e('button', {
      className: 'btn-submit',
      onClick: handleSubmit
    }, 'VERIFY')
  );
}

// Main App Component
function App() {
  const [screen, setScreen] = useState('start');
  const [captchas, setCaptchas] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shakeError, setShakeError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    let interval;
    if (screen === 'game' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [screen, startTime]);
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startGame = () => {
    AudioSystem.playClick();
    const newCaptchas = generateRandomCaptchas();
    setCaptchas(newCaptchas);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setScreen('game');
  };
  
  const handleSuccess = () => {
    if (isMuted) AudioSystem.playSuccess();
    
    const updatedCaptchas = [...captchas];
    updatedCaptchas[currentIndex].endTime = Date.now();
    setCaptchas(updatedCaptchas);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      
      if (currentIndex < captchas.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (isMuted) AudioSystem.playVictory();
        setScreen('results');
      }
    }, 800);
  };
  
  const handleError = () => {
    if (isMuted) AudioSystem.playError();
    
    const updatedCaptchas = [...captchas];
    updatedCaptchas[currentIndex].errors += 1;
    setCaptchas(updatedCaptchas);
    
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };
  
  const playAgain = () => {
    AudioSystem.playClick();
    setScreen('start');
    setElapsedTime(0);
  };
  
  const calculateStats = () => {
    const totalErrors = captchas.reduce((sum, c) => sum + c.errors, 0);
    const totalTime = elapsedTime;
    const avgTimePerChallenge = totalTime / captchas.length;
    
    const baseScore = 500;
    const timeBonus = Math.max(0, 300 - Math.floor(totalTime / 1000) * 5);
    const accuracyBonus = Math.max(0, 200 - totalErrors * 50);
    const finalScore = baseScore + timeBonus + accuracyBonus;
    
    const accuracy = captchas.length / (captchas.length + totalErrors) * 100;
    
    let speedRating = 'Careful';
    if (totalTime < 15000) speedRating = 'Lightning Fast ⚡';
    else if (totalTime < 30000) speedRating = 'Quick 🚀';
    else if (totalTime < 60000) speedRating = 'Steady 🐢';
    
    let humanScore = Math.min(100, 100 - totalErrors * 10 - (totalTime < 5000 ? 20 : 0));
    
    return {
      totalTime,
      totalErrors,
      accuracy: accuracy.toFixed(1),
      finalScore,
      speedRating,
      humanScore,
      avgTimePerChallenge
    };
  };
  
  // Start Screen
  if (screen === 'start') {
    return e('div', { className: 'screen start-screen' },
      e('div', { className: 'glitch-container' },
        e('h1', { className: 'title glitch', 'data-text': 'CAPTCHA CHALLENGE' }, 'CAPTCHA CHALLENGE')
      ),
      e('div', { className: 'subtitle' }, 'Are You Human? Prove It.'),
      e('div', { className: 'instructions' },
        e('p', null, '⚡ Solve 3 random CAPTCHA challenges'),
        e('p', null, '⏱️ Complete as fast as you can'),
        e('p', null, '🎯 Minimize errors for higher score')
      ),
      e('button', {
        className: 'btn-start',
        onClick: startGame
      }, 'START CHALLENGE'),
      e('footer', { className: 'footer' },
        // e('a', { href: 'https://mochiyaki.github.io', target: '_blank', rel: 'noopener' }, 'made with ❤️')
      )
    );
  }
  
  // Game Screen
  if (screen === 'game') {
    const currentCaptcha = captchas[currentIndex];
    
    return e('div', { className: `screen game-screen ${shakeError ? 'shake' : ''}` },
      e('div', { className: 'game-header' },
        e('div', { className: 'challenge-counter' },
          `Challenge ${currentIndex + 1} of ${captchas.length}`
        ),
        e('div', { className: 'timer' }, formatTime(elapsedTime))
      ),
      e('div', { className: 'captcha-wrapper' },
        showSuccess && e('div', { className: 'success-overlay' }, '✓'),
        e('h2', { className: 'captcha-question' }, currentCaptcha.question),
        currentCaptcha.type === 'text' && e(DistortedTextCaptcha, {
          data: currentCaptcha.data,
          onSubmit: handleSuccess,
          onError: handleError
        }),
        currentCaptcha.type === 'image_grid' && e(ImageGridCaptcha, {
          data: currentCaptcha.data,
          onSubmit: handleSuccess,
          onError: handleError
        }),
        currentCaptcha.type === 'arrows' && e(ArrowSequenceCaptcha, {
          data: currentCaptcha.data,
          onSubmit: handleSuccess,
          onError: handleError
        }),
        currentCaptcha.type === 'slider' && e(SliderCaptcha, {
          data: currentCaptcha.data,
          onSubmit: handleSuccess,
          onError: handleError
        })
      )
    );
  }
  
  // Results Screen
  if (screen === 'results') {
    const stats = calculateStats();
    
    return e('div', { className: 'screen results-screen' },
      e('h1', { className: 'results-title' }, 'RESULTS'),
      e('div', { className: 'stats-grid' },
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '⏱️'),
          e('div', { className: 'stat-value' }, formatTime(stats.totalTime)),
          e('div', { className: 'stat-label' }, 'Total Time')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '❌'),
          e('div', { className: 'stat-value' }, stats.totalErrors),
          e('div', { className: 'stat-label' }, 'Errors Made')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '🎯'),
          e('div', { className: 'stat-value' }, `${stats.accuracy}%`),
          e('div', { className: 'stat-label' }, 'Accuracy')
        ),
        e('div', { className: 'stat-card' },
          e('div', { className: 'stat-icon' }, '⭐'),
          e('div', { className: 'stat-value' }, stats.finalScore),
          e('div', { className: 'stat-label' }, 'Score')
        )
      ),
      e('div', { className: 'performance-section' },
        e('div', { className: 'speed-rating' },
          e('div', { className: 'label' }, 'Speed Rating'),
          e('div', { className: 'value' }, stats.speedRating)
        ),
        e('div', { className: 'human-verdict' },
          e('div', { className: 'gauge' },
            e('div', { className: 'gauge-fill', style: { width: `${stats.humanScore}%` } })
          ),
          e('div', { className: 'verdict-text' },
            stats.humanScore > 90 ? '🤖 Perfectly Human!' :
            stats.humanScore > 70 ? '👤 Mostly Human' :
            stats.humanScore > 50 ? '🤔 Suspiciously Fast...' :
            '🚨 Bot-like Behavior Detected!'
          )
        )
      ),
      e('div', { className: 'time-breakdown' },
        e('h3', null, 'Time per Challenge'),
        captchas.map((captcha, i) => {
          const time = captcha.endTime ? 
            (i === 0 ? captcha.endTime - startTime : captcha.endTime - captchas[i-1].endTime) : 
            0;
          return e('div', { key: i, className: 'time-bar' },
            e('div', { className: 'time-label' }, `Challenge ${i + 1}`),
            e('div', { className: 'bar-container' },
              e('div', {
                className: 'bar-fill',
                style: { width: `${(time / stats.avgTimePerChallenge) * 50}%` }
              }),
              e('span', { className: 'time-value' }, formatTime(time))
            )
          );
        })
      ),
      e('button', {
        className: 'btn-play-again',
        onClick: playAgain
      }, 'PLAY AGAIN'),
      e('footer', { className: 'footer' },
        // e('a', { href: 'https://mochiyaki.github.io', target: '_blank', rel: 'noopener' }, 'made with ❤️')
      )
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
