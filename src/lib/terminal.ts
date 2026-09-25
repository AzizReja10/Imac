import { useSetup } from '@/store/useSetup'
import { apps } from '@/data/apps'
import {
  monitorSkins, keyboardSkins, mouseSkins,
  type MonitorSkinId, type KeyboardSkinId, type MouseSkinId,
} from '@/data/skins'

export type Result = string[] | 'clear'

const has = (o: object, k: string) => Object.keys(o).includes(k)

const files: Record<string, () => string> = {
  'readme.txt': () => 'Desk Sim: a tiny Mac desk in your browser.\nType "help" to see what this terminal can do.',
  'notes.txt': () => useSetup.getState().notes || '(empty)', // whatever you typed in Notes
}

export function run(line: string): Result {
  const [cmd, ...args] = line.trim().split(/\s+/)
  if (!cmd) return []
  const st = useSetup.getState()

  switch (cmd.toLowerCase()) {
    case 'help':
      return [
        'Commands:',
        '  help                  show this list',
        '  clear                 clear the screen',
        '  echo <text>           print text',
        '  date                  current date and time',
        '  whoami                who are you?',
        '  ls                    list files',
        '  cat <file>            print a file (try notes.txt)',
        '  open <app>            launch an app, e.g. open notes',
        '  set <thing> <skin>    swap monitor, keyboard or mouse',
        '  neofetch              system info',
      ]

    case 'clear':
      return 'clear'

    case 'echo':
      return [args.join(' ')]

    case 'date':
      return [new Date().toString()]

    case 'whoami':
      return ['guest']

    case 'ls':
      return [Object.keys(files).join('   ')]

    case 'cat': {
      if (!args[0]) return ['usage: cat <file>']
      const f = files[args[0].toLowerCase()]
      return f ? f().split('\n') : [`cat: ${args[0]}: No such file`]
    }

    case 'open': {
      const app = apps.find((a) => a.id === args[0]?.toLowerCase())
      if (!app) return [`open: unknown app "${args[0] ?? ''}". Try: ${apps.map((a) => a.id).join(', ')}`]
      st.openApp(app.id)
      return [`Opening ${app.name}…`]
    }

    case 'set': {
      const [what, skin] = args
      if (what === 'monitor' && has(monitorSkins, skin)) {
        st.setMonitor(skin as MonitorSkinId)
        return [`monitor → ${skin}`]
      }
      if (what === 'keyboard' && has(keyboardSkins, skin)) {
        st.setKeyboard(skin as KeyboardSkinId)
        return [`keyboard → ${skin}`]
      }
      if (what === 'mouse' && has(mouseSkins, skin)) {
        st.setMouse(skin as MouseSkinId)
        return [`mouse → ${skin}`]
      }
      return [
        'usage: set <monitor|keyboard|mouse> <skin>',
        `  monitor:  ${Object.keys(monitorSkins).join(', ')}`,
        `  keyboard: ${Object.keys(keyboardSkins).join(', ')}`,
        `  mouse:    ${Object.keys(mouseSkins).join(', ')}`,
      ]
    }

    case 'neofetch':
      return [
        'guest@desk',
        '----------',
        `Monitor   ${monitorSkins[st.monitor].name} iMac`,
        `Keyboard  ${keyboardSkins[st.keyboard].name}`,
        `Mouse     ${mouseSkins[st.mouse].name}`,
        `Windows   ${st.windows.length} open`,
        'Shell     desksh 1.0',
      ]

    default:
      return [`desksh: command not found: ${cmd}`]
  }
}
