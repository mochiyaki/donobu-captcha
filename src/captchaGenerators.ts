import type { CaptchaData, TextData, ImageGridData, ArrowData, SliderData } from './types';

const CaptchaGenerators = {
  distortedText(): CaptchaData {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const length = 6;
    const text = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    return {
      type: 'text',
      question: 'Enter the characters you see below',
      answer: text,
      data: { text } as TextData
    };
  },

  imageSelection(): CaptchaData {
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
      data: { images, categoryName: category.name } as ImageGridData
    };
  },

  arrowSequence(): CaptchaData {
    const arrows = ['↑', '→', '↓', '←'];
    const length = 5;
    const sequence = Array.from({length}, () => arrows[Math.floor(Math.random() * arrows.length)]);

    return {
      type: 'arrows',
      question: 'Click the arrows in the order shown',
      answer: sequence,
      data: { sequence } as ArrowData
    };
  },

  sliderPuzzle(): CaptchaData {
    const targetPosition = 70 + Math.floor(Math.random() * 10);

    return {
      type: 'slider',
      question: 'Slide to complete the puzzle',
      answer: targetPosition,
      data: { targetPosition, tolerance: 5 } as SliderData
    };
  }
};

export function generateRandomCaptchas(): CaptchaData[] {
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
    startTime: 0,
    endTime: 0,
    errors: 0
  }));
}
