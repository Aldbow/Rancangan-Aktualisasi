// Priority Solution 1: Enhanced blocking script to prevent FOUC completely
export function ThemeScript() {
  const script = `
    (function() {
      // PRIORITY 1: Immediate theme application before any rendering
      var theme = null;
      var systemTheme = 'light';
      var root = document.documentElement;
      
      // Block rendering until theme is applied
      root.style.visibility = 'hidden';
      
      try {
        theme = localStorage.getItem('kemnaker-theme');
        systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (e) {
        // localStorage might not be available in some environments
      }
      
      var appliedTheme = theme || 'light';
      if (appliedTheme === 'system') {
        appliedTheme = systemTheme;
      }
      
      // Apply theme class immediately and synchronously
      root.className = root.className.replace(/\\b(dark|light)\\b/g, '');
      
      if (appliedTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        // Set CSS custom properties for immediate effect
        root.style.setProperty('--theme-bg', '#0f172a');
        root.style.setProperty('--theme-text', '#f8fafc');
      } else {
        root.classList.add('light');
        root.style.colorScheme = 'light';
        root.style.setProperty('--theme-bg', '#ffffff');
        root.style.setProperty('--theme-text', '#1e293b');
      }
      
      // Restore visibility after theme is applied
      root.style.visibility = 'visible';
      
      // Enhanced event listeners for in-app theme changes
      function setupListeners() {
        function applyThemeTransition(newTheme) {
          try {
            var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            var appliedTheme = newTheme || 'light';
            
            if (appliedTheme === 'system') {
              appliedTheme = systemTheme;
            }
            
            // Add transition class for smooth theme switching
            root.classList.add('theme-transitioning');
            
            // Apply new theme
            root.classList.remove('dark', 'light');
            if (appliedTheme === 'dark') {
              root.classList.add('dark');
              root.style.colorScheme = 'dark';
              root.style.setProperty('--theme-bg', '#0f172a');
              root.style.setProperty('--theme-text', '#f8fafc');
            } else {
              root.classList.add('light');
              root.style.colorScheme = 'light';
              root.style.setProperty('--theme-bg', '#ffffff');
              root.style.setProperty('--theme-text', '#1e293b');
            }
            
            // Remove transition class after animation
            setTimeout(function() {
              root.classList.remove('theme-transitioning');
            }, 200);
            
          } catch (e) {
            root.classList.remove('dark');
            root.classList.add('light');
            root.style.colorScheme = 'light';
          }
        }
        
        // Listen for theme changes from other tabs/windows
        window.addEventListener('storage', function(e) {
          if (e.key === 'kemnaker-theme') {
            applyThemeTransition(e.newValue);
          }
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
          var theme = localStorage.getItem('kemnaker-theme');
          if (theme === 'system' || !theme) {
            applyThemeTransition(theme);
          }
        });
        
        // Custom event for immediate theme changes within the app
        window.addEventListener('theme-change', function(e) {
          applyThemeTransition(e.detail.theme);
        });
      }
      
      // Setup listeners immediately
      setupListeners();
    })();
  `;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <style dangerouslySetInnerHTML={{
        __html: `
          /* CSS for smooth theme transitions */
          .theme-transitioning,
          .theme-transitioning * {
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
          }
          
          /* Prevent flash by setting initial background */
          html {
            background-color: var(--theme-bg, #ffffff);
            color: var(--theme-text, #1e293b);
          }
        `
      }} />
    </>
  );
}
