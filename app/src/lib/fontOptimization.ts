// Font Loading Performance Utilities

export const fontLoadingOptimization = {
  // Monitor font loading performance
  monitorFontLoading: () => {
    if (typeof window !== 'undefined') {
      // Monitor font loading events
      document.fonts.addEventListener('loadingdone', (event) => {
        console.log('Font loading completed:', event);
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        console.warn('Font loading error:', event);
      });

      // Check if fonts are loaded
      document.fonts.ready.then(() => {
        console.log('All fonts loaded successfully');
      });
    }
  },

  // Preload critical fonts
  preloadCriticalFonts: () => {
    if (typeof window !== 'undefined') {
      const criticalFonts = [
        // Only preload fonts that are immediately visible
        'Geist-400',
        'Geist-500',
        'Outfit-400',
        'Outfit-500',
      ];

      criticalFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }
  },

  // Lazy load non-critical fonts
  lazyLoadFonts: () => {
    if (typeof window !== 'undefined') {
      // Load additional font weights only when needed
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load additional font weights
            const heavyFonts = ['Geist-600', 'Geist-700', 'Outfit-600', 'Outfit-700'];
            heavyFonts.forEach(font => {
              document.fonts.load(`1em ${font}`);
            });
          }
        });
      });

      // Observe elements that might need heavy fonts
      const heavyTextElements = document.querySelectorAll('h1, h2, h3, .font-bold, .font-semibold');
      heavyTextElements.forEach(el => observer.observe(el));
    }
  },

  // Optimize font display
  optimizeFontDisplay: () => {
    if (typeof window !== 'undefined') {
      // Add font-display: swap to all font faces
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Geist';
          font-display: swap;
        }
        @font-face {
          font-family: 'Outfit';
          font-display: swap;
        }
        @font-face {
          font-family: 'Geist Mono';
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  },

  // Initialize all optimizations
  init: () => {
    if (typeof window !== 'undefined') {
      fontLoadingOptimization.monitorFontLoading();
      fontLoadingOptimization.optimizeFontDisplay();
      
      // Delay non-critical font loading
      setTimeout(() => {
        fontLoadingOptimization.lazyLoadFonts();
      }, 1000);
    }
  }
};

// Export for use in components
export default fontLoadingOptimization; 