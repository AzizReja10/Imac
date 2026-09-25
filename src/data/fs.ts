import { apps, type AppId } from './apps'
import { monitorSkins } from './skins'

export type FsFolder = { kind: 'folder'; name: string; children: FsNode[] }
export type FsApp = { kind: 'app'; name: string; app: AppId }
export type FsFile = {
  kind: 'file'
  name: string
  size: string
  text?: string // shown in the preview pane
  bg?: string // pictures: a CSS background stands in for the image
  opens?: AppId // double-clicking launches this app
}
export type FsNode = FsFolder | FsApp | FsFile

export const root: FsFolder = {
  kind: 'folder',
  name: 'Home',
  children: [
    {
      kind: 'folder',
      name: 'Applications',
      // Built from the dock's app list, so a new app appears here automatically
      children: apps
        .filter((a) => a.id !== 'finder')
        .map((a): FsApp => ({ kind: 'app', name: a.name, app: a.id })),
    },
    {
      kind: 'folder',
      name: 'Documents',
      children: [
        { kind: 'file', name: 'notes.txt', size: '—', opens: 'notes' },
        {
          kind: 'file',
          name: 'todo.md',
          size: '1 KB',
          text: '- [x] Build the desk\n- [x] Add typing sounds\n- [ ] Add a third keyboard\n- [ ] Ship it',
        },
        {
          kind: 'folder',
          name: 'Projects',
          children: [
            {
              kind: 'file',
              name: 'desk-sim.md',
              size: '2 KB',
              text: 'Desk Sim\n\nReact, Framer Motion and Zustand.\nThe keyboard, mouse and monitor are swappable.',
            },
            { kind: 'file', name: 'ideas.txt', size: '1 KB', text: 'A third monitor color?\nA weather widget?\nDark mode wallpaper?' },
          ],
        },
      ],
    },
    {
      kind: 'folder',
      name: 'Downloads',
      children: [{ kind: 'file', name: 'keys.ogg', size: '21 KB', text: '(audio file)' }],
    },
    {
      kind: 'folder',
      name: 'Pictures',
      children: [
        { kind: 'file', name: 'yellow.jpg', size: '1.2 MB', bg: monitorSkins.yellow.wallpaper },
        { kind: 'file', name: 'orange.jpg', size: '1.4 MB', bg: monitorSkins.orange.wallpaper },
      ],
    },
  ],
}

// Walk a path like ['Documents', 'Projects'] down from the root
export function resolve(path: string[]): FsFolder {
  let cur = root
  for (const name of path) {
    const next = cur.children.find((c): c is FsFolder => c.kind === 'folder' && c.name === name)
    if (!next) break
    cur = next
  }
  return cur
}
