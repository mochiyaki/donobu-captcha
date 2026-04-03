import React, { useState, useEffect } from 'react';
import type { CaptchaData, Stats } from './types';
import { generateRandomCaptchas } from './captchaGenerators';
import AudioSystem from './audio';
import DistortedTextCaptcha from './components/DistortedTextCaptcha';
import ImageGridCaptcha from './components/ImageGridCaptcha';
import ArrowSequenceCaptcha from './components/ArrowSequenceCaptcha';
import SliderCaptcha from './components/SliderCaptcha';

type Screen = 'start' | 'game' | 'results';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('start');
  const [captchas, setCaptchas] = useState<CaptchaData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shakeError, setShakeError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (screen === 'game' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, startTime]);

  const formatTime = (ms: number): string => {
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
    if (!isMuted) AudioSystem.playSuccess();

    const updatedCaptchas = [...captchas];
    updatedCaptchas[currentIndex].endTime = Date.now();
    setCaptchas(updatedCaptchas);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);

      if (currentIndex < captchas.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (!isMuted) AudioSystem.playVictory();
        setScreen('results');
      }
    }, 800);
  };

  const handleError = () => {
    if (!isMuted) AudioSystem.playError();

    const updatedCaptchas = [...captchas];
    updatedCaptchas[currentIndex].errors! += 1;
    setCaptchas(updatedCaptchas);

    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const playAgain = () => {
    AudioSystem.playClick();
    setScreen('start');
    setElapsedTime(0);
  };

  const calculateStats = (): Stats => {
    const totalErrors = captchas.reduce((sum, c) => sum + (c.errors || 0), 0);
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
    return (
      <div className="screen start-screen">
        <div className="glitch-container">
          <h1 className="title glitch" data-text="CAPTCHA CHALLENGE">CAPTCHA CHALLENGE</h1>
        </div>
        <div className="subtitle">Are You Human? Prove It.</div>
        <div className="instructions">
          <p>⚡ Solve 3 random CAPTCHA challenges</p>
          <p>⏱️ Complete as fast as you can</p>
          <p>🎯 Minimize errors for higher score</p>
        </div>
        <button
          className="btn-start"
          onClick={startGame}
        >
          START CHALLENGE
        </button>
        <footer className="footer">
          {/* <a href="https://mochiyaki.github.io" target="_blank" rel="noopener">made with ❤️</a> */}
        </footer>
      </div>
    );
  }

  // Game Screen
  if (screen === 'game') {
    const currentCaptcha = captchas[currentIndex];

    return (
      <div className={`screen game-screen ${shakeError ? 'shake' : ''}`}>
        <div className="game-header">
          <div className="challenge-counter">
            Challenge {currentIndex + 1} of {captchas.length}
          </div>
          <div className="timer">{formatTime(elapsedTime)}</div>
        </div>
        <div className="captcha-wrapper">
          {showSuccess && <div className="success-overlay">✓</div>}
          <h2 className="captcha-question">{currentCaptcha.question}</h2>
          {currentCaptcha.type === 'text' && (
            <DistortedTextCaptcha
              data={currentCaptcha.data}
              onSubmit={handleSuccess}
              onError={handleError}
            />
          )}
          {currentCaptcha.type === 'image_grid' && (
            <ImageGridCaptcha
              data={currentCaptcha.data}
              onSubmit={handleSuccess}
              onError={handleError}
            />
          )}
          {currentCaptcha.type === 'arrows' && (
            <ArrowSequenceCaptcha
              data={currentCaptcha.data}
              onSubmit={handleSuccess}
              onError={handleError}
            />
          )}
          {currentCaptcha.type === 'slider' && (
            <SliderCaptcha
              data={currentCaptcha.data}
              onSubmit={handleSuccess}
              onError={handleError}
            />
          )}
        </div>
      </div>
    );
  }

  // Results Screen
  if (screen === 'results') {
    const stats = calculateStats();

    return (
      <div className="screen results-screen">
        <h1 className="results-title">RESULTS</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(stats.totalTime)}</div>
            <div className="stat-label">Total Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{stats.totalErrors}</div>
            <div className="stat-label">Errors Made</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{`${stats.accuracy}%`}</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.finalScore}</div>
            <div className="stat-label">Score</div>
          </div>
        </div>
        <div className="performance-section">
          <div className="speed-rating">
            <div className="label">Speed Rating</div>
            <div className="value">{stats.speedRating}</div>
          </div>
          <div className="human-verdict">
            <div className="gauge">
              <div className="gauge-fill" style={{ width: `${stats.humanScore}%` }} />
            </div>
            <div className="verdict-text">
              {stats.humanScore > 90 ? '🤖 Perfectly Human!' :
               stats.humanScore > 70 ? '👤 Mostly Human' :
               stats.humanScore > 50 ? '🤔 Suspiciously Fast...' :
               '🚨 Bot-like Behavior Detected!'}
            </div>
          </div>
        </div>
        <div className="time-breakdown">
          <h3>Time per Challenge</h3>
          {captchas.map((captcha, i) => {
            const time = captcha.endTime ?
              (i === 0 ? captcha.endTime - (startTime || 0) : captcha.endTime - (captchas[i-1].endTime || 0)) :
              0;
            return (
              <div key={i} className="time-bar">
                <div className="time-label">Challenge {i + 1}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${(time / stats.avgTimePerChallenge) * 50}%` }}
                  />
                  <span className="time-value">{formatTime(time)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="btn-play-again"
          onClick={playAgain}
        >
          PLAY AGAIN
        </button>
        <footer className="footer">
          {/* <a href="https://mochiyaki.github.io" target="_blank" rel="noopener">made with ❤️</a> */}
        </footer>
      </div>
    );
  }

  return null;
};

export default App;
