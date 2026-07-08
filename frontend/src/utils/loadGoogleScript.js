let scriptPromise = null;
export function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.gisLoader = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow retry on next mount
      reject(new Error('Failed to load Google script'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}