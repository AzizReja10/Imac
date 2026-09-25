import { useEffect, useState } from 'react'
import { FaApple, FaWifi, FaBatteryFull } from 'react-icons/fa'
import { useSetup, selectFocused } from '@/store/useSetup'
import { apps } from '@/data/apps'

const menus = ['File', 'Edit', 'View', 'Go', 'Window', 'Help']

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function MenuBar() {
  const now = useClock()
  const focused = useSetup(selectFocused)
  const appName = apps.find((a) => a.id === focused)?.name ?? 'Finder'

  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '')
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const appMenus =
    focused === 'calculator'
      ? ['File', 'Edit', 'View', 'Convert', 'Speech', 'Window', 'Help']
      : focused === 'game'
      ? ['Game', 'Moves', 'Window', 'Help']
      : menus

  return (
    <div className="absolute inset-x-0 top-0 z-40 flex h-[3.4cqw] items-center justify-between bg-white/30 px-[1.4cqw] text-[1.55cqw] text-black/80 backdrop-blur-xl">
      <div className="flex items-center gap-[2cqw]">
        <FaApple className="text-[1.9cqw]" />
        <span className="font-bold">{appName}</span>
        {appMenus.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex items-center gap-[1.6cqw]">
        <FaBatteryFull className="text-[1.9cqw]" />
        <FaWifi className="text-[1.7cqw]" />
        <span>{date}</span>
        <span>{time}</span>
      </div>
    </div>
  )
}
