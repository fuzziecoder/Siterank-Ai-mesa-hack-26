import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';

const ShinyText = ({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0
}) => {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const position = useMotionValue(direction === 'left' ? -spread : spread);
  const [containerWidth, setContainerWidth] = useState(0);
  const animationDirection = useRef(direction === 'left' ? 1 : -1);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [text]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setHasStarted(true), delay * 1000);
      return () => clearTimeout(timer);
    } else {
      setHasStarted(true);
    }
  }, [delay]);

  useAnimationFrame((_, delta) => {
    if (disabled || !hasStarted || (pauseOnHover && isPaused)) return;

    const newPos = position.get() + (speed * animationDirection.current * delta) / 16;

    if (yoyo) {
      if (animationDirection.current === 1 && newPos >= containerWidth + spread) {
        animationDirection.current = -1;
      } else if (animationDirection.current === -1 && newPos <= -spread) {
        animationDirection.current = 1;
      }
    } else {
      if (direction === 'left' && newPos >= containerWidth + spread) {
        position.set(-spread);
        return;
      } else if (direction === 'right' && newPos <= -spread) {
        position.set(containerWidth + spread);
        return;
      }
    }

    position.set(newPos);
  });

  const gradientX = useTransform(position, (pos) => `${pos}px`);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  return (
    <motion.span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        color: disabled ? color : undefined,
        backgroundImage: disabled
          ? undefined
          : `linear-gradient(90deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: disabled ? undefined : `${spread * 2}px 100%`,
        backgroundClip: disabled ? undefined : 'text',
        WebkitBackgroundClip: disabled ? undefined : 'text',
        WebkitTextFillColor: disabled ? undefined : 'transparent',
        backgroundPosition: gradientX,
      }}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
