export type Card = { title: string; text: string; tag?: string; href?: string } // href = another desk:// page
export type Page = { url: string; title: string; intro: string; cards: Card[] }

export const pages: Page[] = [
  {
    url: 'desk://about',
    title: 'About',
    intro: 'Desk Sim is a tiny Mac desk that lives in a browser tab. Everything on this screen is built with web technology.',
    cards: [
      { title: 'React', text: 'Every window, app and key is a component.', tag: 'UI' },
      { title: 'Framer Motion', text: 'Springs drive key presses, the dock, windows and skin swaps.', tag: 'Motion' },
      { title: 'Zustand', text: 'One small store holds your skins, windows and notes.', tag: 'State' },
      { title: 'Web Audio and Howler', text: 'Click sounds are synthesized; key sounds are sliced from a real recording.', tag: 'Sound' },
    ],
  },
  {
    url: 'desk://projects',
    title: 'Projects',
    intro: 'A place to show your work. Replace these cards with your own in src/data/pages.ts.',
    cards: [
      { title: 'Desk Sim', text: 'This site: an interactive Mac desk with a working keyboard, mouse and apps.', tag: 'Featured', href: 'desk://about' },
      { title: 'Your project here', text: 'Add a title, a sentence and a tag. Set href to another desk:// page to make a card clickable.', tag: 'Template' },
    ],
  },
  {
    url: 'desk://shortcuts',
    title: 'Shortcuts',
    intro: 'What works with your real keyboard and mouse.',
    cards: [
      { title: 'Notes', text: 'Open it and just type. Your text is kept while the simulator is open.', tag: 'Typing' },
      { title: 'Calculator', text: 'Digits, + − * / and % work, Enter gives =, Backspace deletes and Esc clears.', tag: 'Keys' },
      { title: 'Terminal', text: 'Try help, then set monitor orange or open notes.', tag: 'Commands' },
      { title: 'Windows', text: 'Drag a title bar to move a window. The red dot closes it.', tag: 'Mouse' },
    ],
  },
]
