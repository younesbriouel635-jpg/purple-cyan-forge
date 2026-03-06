import { useMemo } from "react";
import { Eye } from "lucide-react";

interface LivePreviewProps {
  code: string;
}

const LivePreview = ({ code }: LivePreviewProps) => {
  const srcdoc = useMemo(() => {
    if (!code.trim()) return "";

    // Build a standalone HTML page that renders the React component
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; }
    #root { min-height: 100vh; }
    .error-display { padding: 24px; color: #ef4444; font-family: monospace; font-size: 14px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    try {
      ${code}

      // Try to find the default export or the last defined component
      const componentNames = Object.keys(window).filter(k => 
        typeof window[k] === 'function' && /^[A-Z]/.test(k)
      );
      
      // Use the component defined in the code
      const root = ReactDOM.createRoot(document.getElementById('root'));
      
      // Try rendering - the code should define and render a component
      if (typeof App !== 'undefined') {
        root.render(React.createElement(App));
      } else if (typeof Component !== 'undefined') {
        root.render(React.createElement(Component));
      } else {
        // Try to find any PascalCase function component
        const lastComponent = componentNames[componentNames.length - 1];
        if (lastComponent) {
          root.render(React.createElement(window[lastComponent]));
        } else {
          document.getElementById('root').innerHTML = '<div class="error-display">No component found to render. Make sure your code exports a component named App or Component.</div>';
        }
      }
    } catch (e) {
      document.getElementById('root').innerHTML = '<div class="error-display">Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
  }, [code]);

  if (!code.trim()) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-primary/40" />
        </div>
        <p className="text-sm text-muted-foreground">Live preview will appear here</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start by describing your app in the chat</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={srcdoc}
      className="w-full h-full border-0 bg-white rounded-lg"
      sandbox="allow-scripts allow-same-origin"
      title="Live Preview"
    />
  );
};

export default LivePreview;
