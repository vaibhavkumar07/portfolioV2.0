import { useCallback } from 'react';

/**
 * Mouse-follow spotlight (21st.dev "Spotlight Card" pattern).
 * Writes pointer position into CSS custom props so a `.spotlight-card`
 * pseudo-element can render a radial glow that tracks the cursor.
 */
export function useSpotlight() {
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  return { onMouseMove };
}
