import { useState, useEffect, useCallback, useRef } from 'react';

export interface ResponsiveEditorInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  viewportWidth: number;
  viewportHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  safeAreaBottom: number;
  orientation: 'portrait' | 'landscape';
}

export function useResponsiveEditor() {
  const [info, setInfo] = useState<ResponsiveEditorInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        keyboardHeight: 0,
        isKeyboardOpen: false,
        safeAreaBottom: 0,
        orientation: 'landscape',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      viewportWidth: width,
      viewportHeight: height,
      keyboardHeight: 0,
      isKeyboardOpen: false,
      safeAreaBottom: 0,
      orientation: width > height ? 'landscape' : 'portrait',
    };
  });

  const lastHeightRef = useRef<number>(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const vv = window.visualViewport;
      const width = vv ? vv.width : window.innerWidth;
      const height = vv ? vv.height : window.innerHeight;
      const screenHeight = window.screen?.height || window.innerHeight;
      
      // Detect virtual keyboard opening by checking viewport height difference
      const heightDiff = window.innerHeight - height;
      const isKeyboard = heightDiff > 140;
      const keyboardHeight = isKeyboard ? Math.max(0, heightDiff) : 0;

      setInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        viewportWidth: Math.round(width),
        viewportHeight: Math.round(height),
        keyboardHeight: Math.round(keyboardHeight),
        isKeyboardOpen: isKeyboard,
        safeAreaBottom: isKeyboard ? 0 : 8,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true });
      window.visualViewport.addEventListener('scroll', handleResize, { passive: true });
    }

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return info;
}
