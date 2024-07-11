import { TypeWriterOptions } from '@/types';

export const typeWriter = (
  text: string,
  options: TypeWriterOptions = {}
): Promise<void> => {
  const {
    speed = 50,
    targetId = 'terminal-output',
    onCharacterTyped,
  } = options;

  return new Promise((resolve) => {
    let i = 0;
    const target = document.getElementById(targetId);

    if (!target) {
      console.error(`Element with id "${targetId}" not found`);
      resolve();
      return;
    }

    const timer = setInterval(() => {
      if (i < text.length) {
        const char = text.charAt(i);
        target.insertAdjacentText('beforeend', char);
        onCharacterTyped?.(char, i);
        i++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
};

export const blinkCursor = (
  element: HTMLElement,
  options: {
    duration?: number;
    onBlink?: (isVisible: boolean) => void;
  } = {}
): () => void => {
  const { duration = 500, onBlink } = options;
  let isVisible = true;

  const intervalId = setInterval(() => {
    isVisible = !isVisible;
    element.style.opacity = isVisible ? '1' : '0';
    onBlink?.(isVisible);
  }, duration);

  // Return a function to stop the blinking
  return () => clearInterval(intervalId);
};

export const scrollToBottom = (
  element: HTMLElement,
  options: {
    smooth?: boolean;
    onComplete?: () => void;
  } = {}
): void => {
  const { smooth = true, onComplete } = options;

  if (smooth) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth'
    });
    // Wait for the scroll to complete before calling onComplete
    setTimeout(() => onComplete?.(), 300);
  } else {
    element.scrollTop = element.scrollHeight;
    onComplete?.();
  }
};

export const fadeIn = (
  element: HTMLElement,
  duration: number = 500
): Promise<void> => {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.display = 'block';

    let start: number | null = null;
    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      element.style.opacity = Math.min(progress / duration, 1).toString();
      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    window.requestAnimationFrame(step);
  });
};