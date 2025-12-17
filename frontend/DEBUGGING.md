# Debugging Guide

## Source Maps Configuration

Source maps are now enabled for debugging. Follow these steps to debug your source code:

## Steps to Debug

### 1. Clear Build Cache
```bash
cd frontend
rm -rf .next
```

### 2. Start Development Server with Debug Mode
```bash
npm run dev
# or for Node.js debugging:
npm run dev:debug
```

### 3. Browser DevTools Setup

#### Chrome/Edge:
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Sources** tab
3. Enable **"Enable JavaScript source maps"** in Settings (⚙️)
4. You should now see your source files under `webpack://` or directly in the file tree

#### Firefox:
1. Open DevTools (F12)
2. Go to **Debugger** tab
3. Source maps are enabled by default
4. Your source files should appear in the file tree

### 4. Setting Breakpoints

1. Open the **Sources** tab (Chrome) or **Debugger** tab (Firefox)
2. Navigate to your source file (e.g., `app/tool/page.tsx`)
3. Click on the line number to set a breakpoint
4. Refresh the page or trigger the code path
5. Execution will pause at your breakpoint

### 5. VS Code Debugging (Optional)

If you want to debug from VS Code, create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

## Troubleshooting

### Source maps not showing?
1. **Clear cache**: `rm -rf .next` and restart dev server
2. **Check browser settings**: Ensure source maps are enabled in DevTools
3. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Check Network tab**: Look for `.map` files being loaded

### Still seeing compiled code?
1. Make sure you're running `npm run dev` (not `npm run build && npm start`)
2. Check that `NODE_ENV` is not set to `production`
3. Verify `next.config.js` has the webpack configuration
4. Try disabling browser extensions that might interfere

### Breakpoints not working?
1. Ensure source maps are loaded (check Network tab for `.map` files)
2. Try using `debugger;` statements in your code as an alternative
3. Check that the file path matches exactly (case-sensitive)

## Configuration Details

- **TypeScript source maps**: Enabled in `tsconfig.json` (`"sourceMap": true`)
- **Webpack source maps**: Enabled in `next.config.js` (`devtool: 'eval-source-map'`)
- **Development mode**: Source maps are automatically enabled in Next.js dev mode

## Alternative: Using `debugger;` Statements

You can also add `debugger;` statements directly in your code:

```typescript
const handleCreateFolder = () => {
  debugger; // Execution will pause here
  if (newFolderName.trim()) {
    // ...
  }
};
```

This works even without source maps, but you'll see the compiled code.

