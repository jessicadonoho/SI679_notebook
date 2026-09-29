import githubDark from '@shikijs/themes/github-dark';
import githubLight from '@shikijs/themes/github-light';
import type { ThemeRegistration } from 'shiki';

// Code highlighting for the dark academia theme: GitHub's token rules
// with colors swapped for the site palette. Every token color is at
// least 7:1 against the code block background it sits on
// (--vp-code-block-bg in custom.css), comments included and on
// red-highlighted lines too, so long study sessions stay readable. Comments are also italic so they
// stand apart without being dimmed.

type ColorMap = Record<string, string>;

function recolor(base: ThemeRegistration, name: string, map: ColorMap): ThemeRegistration {
  const swap = (c?: string) => (c ? (map[c.toUpperCase()] ?? c) : c);
  return {
    ...base,
    name,
    colors: Object.fromEntries(Object.entries(base.colors ?? {}).map(([k, v]) => [k, swap(v)!])),
    tokenColors: (base.tokenColors ?? []).map((rule) => {
      const settings = { ...rule.settings, foreground: swap(rule.settings.foreground) };
      if (rule.settings.foreground?.toUpperCase() === map.__comment) {
        settings.fontStyle = 'italic';
      }
      return { ...rule, settings };
    }),
  };
}

// light: on #eadfcc
export const vellumInk = recolor(githubLight as ThemeRegistration, 'vellum-ink', {
  __comment: '#6A737D',
  '#24292E': '#1f1418', // plain text: ink
  '#D73A49': '#730a17', // keywords: oxblood
  '#6F42C1': '#47206c', // functions: plum
  '#005CC5': '#0c3669', // constants, numbers: midnight blue
  '#032F62': '#4d3200', // strings: sepia
  '#6A737D': '#40332e', // comments: walnut
  '#E36209': '#622504', // parameters: rust
  '#22863A': '#123d1a', // tags, inserted: ivy
  '#B31D28': '#730a17', // invalid, deleted
  '#586069': '#40332e',
});

// dark: on #160f13
export const cryptCandle = recolor(githubDark as ThemeRegistration, 'crypt-candle', {
  __comment: '#6A737D',
  '#E1E4E8': '#ece0cc', // plain text: bone
  '#F97583': '#ff8f98', // keywords: blood rose
  '#B392F0': '#cfb0f5', // functions: lavender
  '#79B8FF': '#93c5f7', // constants, numbers: moonlight
  '#9ECBFF': '#e8c889', // strings: candle gold
  '#6A737D': '#b3a58f', // comments: parchment
  '#FFAB70': '#ffb38a', // parameters: ember
  '#85E89D': '#a9dcb0', // tags, inserted: sage
  '#FDAEB7': '#ffb3bb', // invalid, deleted
  '#DBEDFF': '#ece0cc',
  '#D1D5DA': '#ece0cc',
});
