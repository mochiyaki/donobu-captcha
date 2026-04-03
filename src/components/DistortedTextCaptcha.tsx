import React, { useRef, useEffect, useState } from 'react';
import type { TextData } from '../types';
import AudioSystem from '../audio';

interface DistortedTextCaptchaProps {
  data: TextData;
  onSubmit: () => void;
  onError: () => void;
}

const DistortedTextCaptcha: React.FC<DistortedTextCaptchaProps> = ({ data, onSubmit, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === data.text) {
      onSubmit();
    } else {
      onError();
      setInput('');
    }
  };

  return (
    <div className="captcha-container">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="captcha-canvas"
      />
      <form onSubmit={handleSubmit} className="captcha-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type the characters"
          className="captcha-input"
          autoFocus
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-submit"
          onClick={() => AudioSystem.playClick()}
        >
          VERIFY
        </button>
      </form>
    </div>
  );
};

export default DistortedTextCaptcha;
