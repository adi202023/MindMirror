import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp - Animates a number from 0 to targetValue
 * @param {number} targetValue
 * @param {number} duration - animation duration in ms
 * @param {number} decimals - decimal places to show
 * @param {boolean} start - whether to start counting
 */
export function useCountUp(targetValue, duration = 1200, decimals = 0, start = true) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    const startVal = 0;
    const endVal = targetValue;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;

      setDisplayValue(parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = null;
    };
  }, [targetValue, duration, decimals, start]);

  return displayValue;
}

export default useCountUp;
