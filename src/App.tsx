import { lazy, Suspense } from 'react'
import Monitor from '@/components/desk/Monitor'
import Keyboard from '@/components/desk/Keyboard'
import Mouse from '@/components/desk/Mouse'
import Tilt from '@/components/desk/Tilt'
import { useInputSounds } from '@/hooks/useInputSounds'
import { usePointerPress } from '@/hooks/usePointerPress'
import { useLook } from '@/hooks/useLook'

const Background = lazy(() => import('@/components/scene/Background'))

export default function App() {
  useInputSounds()
  usePointerPress()
  useLook()

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#ffffff_0%,#f5f5f4_45%,#e7e5e4_100%)] p-2 sm:p-4">
      <Suspense fallback={null}>
        <Background />
      </Suspense>

      <Tilt className="relative z-10 flex h-full max-h-screen w-full flex-col items-center justify-center max-w-[1250px]">
        {/* Monitor: main hero component, enlarged further to fill space prominently */}
        <div className="w-[min(86vh,92vw,1160px)] shrink-0">
          <Monitor />
        </div>

        {/* Keyboard & Mouse: keyboard centered directly under monitor, mouse to the right */}
        <div className="relative mt-2.5 sm:mt-3.5 flex w-full items-center justify-center shrink-0">
          {/* Keyboard: reduced width to sit neatly as an accessory to the prominent monitor */}
          <div className="w-[min(48vw,620px)] shrink-0">
            <Keyboard />
          </div>

          {/* Mouse: positioned neatly to the right of the centered keyboard */}
          <div className="absolute left-[calc(50%+min(24vw,310px)+12px)] sm:left-[calc(50%+min(24vw,310px)+18px)] w-[min(9vw,110px)] shrink-0">
            <Mouse />
          </div>
        </div>
      </Tilt>
    </main>
  )
}
