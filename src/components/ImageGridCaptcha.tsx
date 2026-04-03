import React, { useState } from 'react';
import type { ImageGridData } from '../types';
import AudioSystem from '../audio';

interface ImageGridCaptchaProps {
  data: ImageGridData;
  onSubmit: () => void;
  onError: () => void;
}

const ImageGridCaptcha: React.FC<ImageGridCaptchaProps> = ({ data, onSubmit, onError }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { images } = data;

  const toggleImage = (id: number) => {
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

  return (
    <div className="captcha-container">
      <div className="image-grid">
        {images.map(img => (
          <div
            key={img.id}
            className={`image-cell ${selected.has(img.id) ? 'selected' : ''}`}
            onClick={() => toggleImage(img.id)}
          >
            {img.emoji}
          </div>
        ))}
      </div>
      <button
        className="btn-submit"
        onClick={handleSubmit}
        disabled={selected.size === 0}
      >
        VERIFY
      </button>
    </div>
  );
};

export default ImageGridCaptcha;
