'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const FullScreenConfetti = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize(); // Set initial size
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={300}
      recycle={true}
      gravity={0.3}
    />
  );
};

export default FullScreenConfetti;
