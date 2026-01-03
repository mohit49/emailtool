# Assets Folder

This folder is for storing static assets like logos, images, and other files that need to be served directly.

## Logo Usage

Place your logo PNG file here as `logo.png` and reference it in your code as:

```tsx
// Using Next.js Image component (recommended)
import Image from 'next/image';

<Image 
  src="/assets/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
/>

// Or using regular img tag
<img src="/assets/logo.png" alt="Logo" />
```

## File Structure

```
public/
  └── assets/
      └── logo.png  ← Put your logo here
```

**Note:** Files in the `public` folder are served from the root URL, so `/assets/logo.png` refers to `public/assets/logo.png`.

