# Przio Popup SDK

A lightweight JavaScript SDK for injecting popups into your website.

## Installation

### Method 1: Simple Script Tag (Recommended)

Add this script tag to your website's `<head>` or before the closing `</body>` tag:

```html
<script src="https://yourdomain.com/sdk.js" data-project-id="YOUR_PROJECT_ID"></script>
```

Replace `YOUR_PROJECT_ID` with your actual project ID.

### Method 2: Manual Initialization

```html
<script src="https://yourdomain.com/sdk.js"></script>
<script>
  window.PrzioSDK.init({
    projectId: 'YOUR_PROJECT_ID',
    debug: true // Optional: enable debug logging
  });
</script>
```

## Features

- ✅ Automatic popup injection based on URL conditions
- ✅ Support for multiple popups per page
- ✅ SPA (Single Page Application) support with automatic URL change detection
- ✅ Caching for better performance (5-minute cache)
- ✅ Animate.css animation support
- ✅ Close button functionality
- ✅ Lightweight and fast

## Configuration Options

```javascript
window.PrzioSDK.init({
  projectId: 'YOUR_PROJECT_ID',  // Required
  apiUrl: 'https://yourdomain.com/api/sdk', // Optional: defaults to same origin
  debug: false // Optional: enable console logging
});
```

## URL Conditions

The SDK automatically checks URL conditions before showing popups:

- **contains**: URL contains the specified value
- **equals**: URL exactly matches the value
- **startsWith**: URL starts with the value
- **doesNotContain**: URL does not contain the value
- **landing**: Is the landing page (home page)

## Logic Operators

- **OR** (default): Show popup if ANY condition matches
- **AND**: Show popup only if ALL conditions match

## API

### `PrzioSDK.init(options)`

Initialize the SDK with configuration options.

### `PrzioSDK.processPopups()`

Manually trigger popup processing (useful for SPA navigation).

### `PrzioSDK.config()`

Get current SDK configuration.

### `PrzioSDK.version`

Get SDK version string.

## Example Usage

### Basic HTML Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <script src="https://yourdomain.com/sdk.js" data-project-id="507f1f77bcf86cd799439011"></script>
</head>
<body>
  <h1>Welcome to my website</h1>
</body>
</html>
```

### React/Next.js

```jsx
import { useEffect } from 'react';

function MyApp() {
  useEffect(() => {
    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://yourdomain.com/sdk.js';
    script.setAttribute('data-project-id', 'YOUR_PROJECT_ID');
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return <div>My App</div>;
}
```

### Vue.js

```vue
<template>
  <div>My App</div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://yourdomain.com/sdk.js';
    script.setAttribute('data-project-id', 'YOUR_PROJECT_ID');
    document.body.appendChild(script);
  }
}
</script>
```

## Troubleshooting

### Enable Debug Mode

```javascript
window.PrzioSDK.init({
  projectId: 'YOUR_PROJECT_ID',
  debug: true
});
```

This will log detailed information to the browser console.

### Check if SDK Loaded

```javascript
if (window.PrzioSDK) {
  console.log('SDK loaded successfully');
  console.log('Version:', window.PrzioSDK.version);
} else {
  console.error('SDK failed to load');
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - All rights reserved







