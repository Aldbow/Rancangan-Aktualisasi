// No-op theme script to prevent hydration mismatch
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('kemnaker-theme') || 'light';
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var appliedTheme = theme === 'system' ? systemTheme : theme;
              
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(appliedTheme);
              document.documentElement.setAttribute('data-theme', appliedTheme);
            } catch (e) {
              // Fallback to light theme if there's any error
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add('light');
              document.documentElement.setAttribute('data-theme', 'light');
            }
          })();
        `,
      }}
    />
  );
}
