import type { AppId } from '@/data/apps'
import Notes from './Notes'
import Settings from './Settings'
import Calculator from './Calculator'
import Terminal from './Terminal'
import Finder from './Finder'
import Safari from './Safari'
import Game from './Game'

export default function AppBody({ id }: { id: AppId }) {
  switch (id) {
    case 'notes':
      return <Notes />
    case 'settings':
      return <Settings />
    case 'calculator':
      return <Calculator />
    case 'terminal':
      return <Terminal />
    case 'finder':
      return <Finder />
    case 'safari':
      return <Safari />
    case 'game':
      return <Game />
    default:
      return (
        <div className="flex flex-1 items-center justify-center text-[1.6cqw] text-black/40">
          {id} · coming soon
        </div>
      )
  }
}
