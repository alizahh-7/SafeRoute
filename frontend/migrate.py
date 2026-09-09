import json
import re

with open('tailwind.config.js', 'r') as f:
    content = f.read()

# Very naive extraction of the JS object
# We'll just extract the JSON-like part
content = content.replace('export default ', '')
content = content.replace('};', '}')
# Remove JS comments if any
content = re.sub(r'//.*', '', content)
content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

# Since it has unquoted keys, it's not valid JSON.
# Instead of parsing, I will just output a hardcoded string based on what I saw.

theme_css = """
@theme {
  --color-on-error-container: #93000a;
  --color-tertiary-fixed: #ffdf93;
  --color-background: #fbf9f6;
  --color-tertiary: #765b00;
  --color-error-container: #ffdad6;
  --color-secondary-container: #fdc756;
  --color-on-tertiary: #ffffff;
  --color-surface-variant: #e4e2df;
  --color-on-tertiary-fixed: #241a00;
  --color-surface-bright: #fbf9f6;
  --color-inverse-surface: #30312f;
  --color-on-primary-container: #858481;
  --color-on-secondary-fixed-variant: #5d4200;
  --color-on-primary-fixed-variant: #474744;
  --color-surface-container: #efeeeb;
  --color-secondary: #7b5900;
  --color-on-primary: #ffffff;
  --color-surface-tint: #5f5e5c;
  --color-inverse-primary: #c9c6c3;
  --color-primary: #000000;
  --color-secondary-fixed-dim: #f4be4e;
  --color-error: #ba1a1a;
  --color-on-primary-fixed: #1c1c1a;
  --color-inverse-on-surface: #f2f0ed;
  --color-surface-container-low: #f5f3f0;
  --color-surface-container-lowest: #ffffff;
  --color-on-secondary-container: #725200;
  --color-on-tertiary-fixed-variant: #594400;
  --color-on-secondary-fixed: #261900;
  --color-on-secondary: #ffffff;
  --color-secondary-fixed: #ffdea4;
  --color-on-tertiary-container: #503d00;
  --color-tertiary-fixed-dim: #edc14a;
  --color-on-background: #1b1c1a;
  --color-primary-fixed-dim: #c9c6c3;
  --color-outline-variant: #c8c7bf;
  --color-on-surface: #1b1c1a;
  --color-tertiary-container: #cfa630;
  --color-on-surface-variant: #474741;
  --color-surface-dim: #dbdad7;
  --color-on-error: #ffffff;
  --color-outline: #777771;
  --color-primary-container: #1c1c1a;
  --color-surface-container-high: #eae8e5;
  --color-primary-fixed: #e5e2de;
  --color-surface-container-highest: #e4e2df;
  --color-surface: #fbf9f6;

  --radius-DEFAULT: 1rem;
  --radius-lg: 2rem;
  --radius-xl: 3rem;
  --radius-full: 9999px;

  --spacing-space-3xl: 3.5rem;
  --spacing-layout-margin-tablet: 1.5rem;
  --spacing-layout-margin-desktop: 2.5rem;
  --spacing-space-lg: 1.5rem;
  --spacing-space-2xl: 2.5rem;
  --spacing-space-sm: 0.75rem;
  --spacing-grid-gutter: 1.25rem;
  --spacing-space-xs: 0.5rem;
  --spacing-layout-margin-mobile: 1rem;
  --spacing-space-md: 1rem;
  --spacing-space-2xs: 0.25rem;
  --spacing-space-xl: 2rem;

  --font-headline-lg: "Plus Jakarta Sans", sans-serif;
  --font-body-md: "Plus Jakarta Sans", sans-serif;
  --font-display-hero-mobile: "Plus Jakarta Sans", sans-serif;
  --font-body-lg: "Plus Jakarta Sans", sans-serif;
  --font-label-caps-micro: "Space Grotesk", sans-serif;
  --font-label-code-md: "Space Grotesk", sans-serif;
  --font-headline-md: "Plus Jakarta Sans", sans-serif;
  --font-headline-sm: "Plus Jakarta Sans", sans-serif;
  --font-headline-lg-mobile: "Plus Jakarta Sans", sans-serif;
  --font-body-sm: "Plus Jakarta Sans", sans-serif;
  --font-label-code-lg: "Space Grotesk", sans-serif;
  --font-display-hero: "Plus Jakarta Sans", sans-serif;

  --text-headline-lg: 30px;
  --text-headline-lg--line-height: 38px;
  --text-headline-lg--letter-spacing: -0.025em;
  --text-headline-lg--font-weight: 400;

  --text-body-md: 13px;
  --text-body-md--line-height: 20px;
  --text-body-md--letter-spacing: 0em;
  --text-body-md--font-weight: 400;

  --text-display-hero-mobile: 32px;
  --text-display-hero-mobile--line-height: 38px;
  --text-display-hero-mobile--letter-spacing: -0.02em;
  --text-display-hero-mobile--font-weight: 500;

  --text-body-lg: 15px;
  --text-body-lg--line-height: 24px;
  --text-body-lg--letter-spacing: -0.005em;
  --text-body-lg--font-weight: 400;

  --text-label-caps-micro: 10px;
  --text-label-caps-micro--line-height: 12px;
  --text-label-caps-micro--letter-spacing: 0.08em;
  --text-label-caps-micro--font-weight: 700;

  --text-label-code-md: 12px;
  --text-label-code-md--line-height: 16px;
  --text-label-code-md--letter-spacing: 0.02em;
  --text-label-code-md--font-weight: 500;

  --text-headline-md: 22px;
  --text-headline-md--line-height: 28px;
  --text-headline-md--letter-spacing: -0.015em;
  --text-headline-md--font-weight: 500;

  --text-headline-sm: 17px;
  --text-headline-sm--line-height: 22px;
  --text-headline-sm--letter-spacing: -0.01em;
  --text-headline-sm--font-weight: 600;

  --text-headline-lg-mobile: 24px;
  --text-headline-lg-mobile--line-height: 30px;
  --text-headline-lg-mobile--letter-spacing: -0.015em;
  --text-headline-lg-mobile--font-weight: 500;

  --text-body-sm: 12px;
  --text-body-sm--line-height: 17px;
  --text-body-sm--letter-spacing: 0.01em;
  --text-body-sm--font-weight: 400;

  --text-label-code-lg: 14px;
  --text-label-code-lg--line-height: 18px;
  --text-label-code-lg--letter-spacing: 0.01em;
  --text-label-code-lg--font-weight: 600;

  --text-display-hero: 44px;
  --text-display-hero--line-height: 52px;
  --text-display-hero--letter-spacing: -0.03em;
  --text-display-hero--font-weight: 400;
}
"""

with open('src/index.css', 'r') as f:
    css = f.read()

css = css.replace('@config "../tailwind.config.js";', theme_css)

with open('src/index.css', 'w') as f:
    f.write(css)

print("Injected native @theme variables into index.css")
