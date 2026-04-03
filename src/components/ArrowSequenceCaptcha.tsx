import React, { useState } from 'react';
import type { ArrowData } from '../types';
import AudioSystem from '../audio';

interface ArrowSequenceCaptchaProps {
  data: ArrowData;
  onSubmit: () => void;
  onError: () => void;
}

const ArrowSequenceCaptcha: React.FC<ArrowSequenceCaptchaProps> = ({ data, onSubmit, onError }) => {
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const { sequence } = data;

  const handleArrowClick = (arrow: string) => {
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

  return (
    <div className="captcha-container">
      <div className="arrow-display">
        {sequence.map((arrow, i) => (
          <span
            key={i}
            className={`arrow-symbol ${i < userSequence.length ? 'completed' : ''}`}
          >
            {arrow}
          </span>
        ))}
      </div>
      <div className="arrow-input">
        {['↑', '→', '↓', '←'].map(arrow => (
          <button
            key={arrow}
            className="arrow-btn"
            onClick={() => handleArrowClick(arrow)}
          >
            {arrow}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArrowSequenceCaptcha;
