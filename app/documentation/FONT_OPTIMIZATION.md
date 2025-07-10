# Font Optimization Guide

## Understanding Font Preloading Warnings

The warnings you're seeing are related to Next.js preloading font files that aren't used immediately after page load:

```
The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event.
```

### Why This Happens

1. **Aggressive Preloading**: Next.js preloads all font weights/styles by default
2. **Delayed Font Usage**: Some fonts are only used in components that load later
3. **Unused Font Weights**: Preloading font weights that aren't immediately visible

## Optimizations Implemented

### 1. Font Configuration (`layout.tsx`)

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",                    // Prevents invisible text during font load
  preload: true,                      // Only for critical fonts
  weight: ["400", "500", "600", "700"], // Only load used weights
  fallback: ["system-ui", "arial"],   // Fallback fonts
});
```

### 2. Next.js Configuration (`next.config.mjs`)

- `optimizeFonts: true` - Enables font optimization
- `fontLoaders` configuration for better control
- Performance headers for better resource loading

### 3. CSS Optimizations (`globals.css`)

```css
@font-face {
  font-family: 'Geist';
  font-display: swap; /* Prevents invisible text */
}
```

### 4. Runtime Optimization (`fontOptimization.ts`)

- Monitors font loading performance
- Lazy loads non-critical font weights
- Preloads only immediately needed fonts

## Best Practices

### ✅ Do
- Use `display: "swap"` for all fonts
- Specify only needed font weights
- Set `preload: false` for non-critical fonts
- Add fallback fonts
- Monitor font loading performance

### ❌ Don't
- Preload all font weights unnecessarily
- Load fonts synchronously
- Ignore font loading warnings
- Use fonts without fallbacks

## Reducing Warnings Further

### 1. Conditional Font Loading

```typescript
// Only load heavy fonts when needed
const heavyFont = Geist({
  weight: ["700", "800"],
  preload: false, // Don't preload heavy weights
});
```

### 2. Component-Level Font Loading

```typescript
// Load fonts only when component mounts
useEffect(() => {
  document.fonts.load('1em Geist-700');
}, []);
```

### 3. Intersection Observer for Heavy Fonts

```typescript
// Load heavy fonts only when heavy text is visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.fonts.load('1em Geist-700');
    }
  });
});
```

## Monitoring Font Performance

### Browser DevTools
1. Open DevTools → Network tab
2. Filter by "Font" to see font loading
3. Check timing and size of font files

### Performance API
```javascript
// Monitor font loading performance
document.fonts.ready.then(() => {
  console.log('All fonts loaded');
});
```

### Lighthouse
- Run Lighthouse audit
- Check "Eliminate render-blocking resources"
- Monitor "Largest Contentful Paint" metrics

## Expected Results

After implementing these optimizations:

1. **Reduced Warnings**: Fewer font preloading warnings
2. **Faster Loading**: Improved page load performance
3. **Better UX**: No invisible text during font loading
4. **Smaller Bundle**: Only necessary font weights loaded

## Troubleshooting

### Still Seeing Warnings?

1. **Check Font Usage**: Ensure preloaded fonts are used immediately
2. **Adjust Preload Strategy**: Set `preload: false` for delayed fonts
3. **Monitor Network Tab**: Verify which fonts are actually needed
4. **Use Font Display**: Ensure all fonts have `display: "swap"`

### Performance Issues?

1. **Reduce Font Weights**: Only load necessary weights
2. **Implement Lazy Loading**: Load heavy fonts on demand
3. **Use System Fonts**: Consider system fonts for better performance
4. **Optimize Critical Path**: Prioritize above-the-fold fonts

## Configuration Summary

The current setup optimizes for:
- ✅ Minimal font preloading warnings
- ✅ Fast initial page load
- ✅ Good user experience
- ✅ Proper fallback handling
- ✅ Performance monitoring 