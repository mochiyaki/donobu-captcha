import React, { useState } from 'react';
import type { SliderData } from '../types';
import AudioSystem from '../audio';

interface SliderCaptchaProps {
  data: SliderData;
  onSubmit: () => void;
  onError: () => void;
}

const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ data, onSubmit, onError }) => {
  const [position, setPosition] = useState(0);
  const { targetPosition, tolerance } = data;

  const handleSubmit = () => {
    if (Math.abs(position - targetPosition) <= tolerance) {
      onSubmit();
    } else {
      onError();
      setPosition(0);
    }
  };

  return (
    <div className="captcha-container">
      <div className="slider-container">
        <div className="slider-track">
          <div
            className="slider-target"
            style={{ left: `${targetPosition}%` }}
          />
          <div
            className="slider-piece"
            style={{ left: `${position}%` }}
          >
            🧩
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="slider-input"
        />
      </div>
      <button
        className="btn-submit"
        onClick={handleSubmit}
      >
        VERIFY
      </button>
    </div>
  );
};

export default SliderCaptcha;
