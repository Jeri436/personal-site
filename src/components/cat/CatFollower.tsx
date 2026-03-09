import { useEffect, useRef, useState } from 'react'

const SIZE = 64

type Dir = 'S' | 'SE' | 'E' | 'NE' | 'N' | 'NW' | 'W' | 'SW'
type Motion = 'idle' | 'idle2' | 'walking' | 'running'

function frames(folder: string, name: string, count: number) {
  return Array.from(
    { length: count },
    (_, i) => `/personal-site/cat/${folder}/${name}_${i}.png`,
  )
}

const ANIM_IDLE = frames('idle', 'idle', 12)
const ANIM_IDLE_ALT = frames('idle', 'idle_alt', 12)

const ANIM_WALK: Record<Dir, string[]> = {
  S: frames('walk', 's', 4),
  E: frames('walk', 'e', 4),
  SE: frames('walk', 'se', 4),
  NE: frames('walk', 'ne', 4),
  N: frames('walk', 'n', 4),
  NW: frames('walk', 'nw', 4),
  SW: frames('walk', 'sw', 4),
  W: frames('walk', 'w', 4),
}

const ANIM_RUN: Record<Dir, string[]> = {
  S: frames('run', 's', 4),
  E: frames('run', 'e', 4),
  SE: frames('run', 'se', 4),
  NE: frames('run', 'ne', 4),
  N: frames('run', 'n', 4),
  NW: frames('run', 'nw', 4),
  SW: frames('run', 'sw', 4),
  W: frames('run', 'w', 4),
}

const FRAME_MS: Record<Motion, number> = {
  idle: 110,
  idle2: 110,
  walking: 80,
  running: 48,
}
const SPEED = { walking: 2, running: 5, wandering: 0.8 }
const ARRIVE_THRESH = 38
const RUN_THRESH = 200
const WANDER_IDLE_CHANCE = 0.3
const WANDER_PAUSE_MIN = 1200
const WANDER_PAUSE_MAX = 3000
const CURSOR_WANDER_DELAY = 3000

function angleToDir(dx: number, dy: number): Dir {
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI
  if (deg >= -22.5 && deg < 22.5) return 'E'
  if (deg >= 22.5 && deg < 67.5) return 'SE'
  if (deg >= 67.5 && deg < 112.5) return 'S'
  if (deg >= 112.5 && deg < 157.5) return 'SW'
  if (deg >= 157.5 || deg < -157.5) return 'W'
  if (deg >= -157.5 && deg < -112.5) return 'NW'
  if (deg >= -112.5 && deg < -67.5) return 'N'
  return 'NE'
}

function getFrames(motion: Motion, dir: Dir): string[] {
  if (motion === 'idle') return ANIM_IDLE
  if (motion === 'idle2') return ANIM_IDLE_ALT
  if (motion === 'walking') return ANIM_WALK[dir]
  return ANIM_RUN[dir]
}

export default function CatFollower() {
  const wrapRef = useRef<HTMLDivElement>(null)

  const motionRef = useRef<Motion>('idle')
  const dirRef = useRef<Dir>('S')
  const catPos = useRef({ x: 0, y: 0 })
  const targetPos = useRef({ x: 0, y: 0 })
  const isWanderingRef = useRef(true)
  const wanderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const arriveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number>(0)

  const [frameList, setFrameList] = useState<string[]>(ANIM_IDLE)
  const [frameIdx, setFrameIdx] = useState(0)
  const frameListRef = useRef<string[]>(ANIM_IDLE)

  function setMotion(motion: Motion, dir: Dir) {
    if (motion === motionRef.current && dir === dirRef.current) return
    motionRef.current = motion
    dirRef.current = dir
    const list = getFrames(motion, dir)
    frameListRef.current = list
    setFrameList(list)
    setFrameIdx(0)
  }

  function pickWanderTarget() {
    const margin = 80
    targetPos.current = {
      x: margin + Math.random() * (window.innerWidth - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    }
  }

  function scheduleWander(delayMs?: number) {
    if (wanderTimerRef.current) clearTimeout(wanderTimerRef.current)
    const delay =
      delayMs ??
      WANDER_PAUSE_MIN + Math.random() * (WANDER_PAUSE_MAX - WANDER_PAUSE_MIN)
    wanderTimerRef.current = setTimeout(() => {
      wanderTimerRef.current = null
      if (isWanderingRef.current) pickWanderTarget()
    }, delay)
  }

  // idle plays once then freezes; walk/run loops continuously
  useEffect(() => {
    const isIdleAnim =
      motionRef.current === 'idle' || motionRef.current === 'idle2'
    let i = 0
    const ms = FRAME_MS[motionRef.current]
    const id = setInterval(() => {
      const next = i + 1
      if (isIdleAnim && next >= frameList.length) {
        clearInterval(id)
        return
      }
      i = next % frameList.length
      setFrameIdx(i)
    }, ms)
    return () => clearInterval(id)
  }, [frameList])

  useEffect(() => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    catPos.current = { x: cx, y: cy }
    targetPos.current = { x: cx, y: cy }
    if (wrapRef.current) {
      wrapRef.current.style.transform = `translate(${cx - SIZE / 2}px, ${cy - SIZE / 2}px)`
    }
    scheduleWander(1500)
    return () => {
      if (wanderTimerRef.current) clearTimeout(wanderTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      isWanderingRef.current = false
      if (wanderTimerRef.current) {
        clearTimeout(wanderTimerRef.current)
        wanderTimerRef.current = null
      }
      targetPos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const tick = () => {
      const cat = catPos.current
      const target = targetPos.current
      const dx = target.x - cat.x
      const dy = target.y - cat.y
      const dist = Math.hypot(dx, dy)

      if (dist > ARRIVE_THRESH) {
        if (arriveTimerRef.current) {
          clearTimeout(arriveTimerRef.current)
          arriveTimerRef.current = null
        }

        const motion: Motion = isWanderingRef.current
          ? 'walking'
          : dist > RUN_THRESH
            ? 'running'
            : 'walking'
        const dir = angleToDir(dx, dy)
        setMotion(motion, dir)

        const speed = isWanderingRef.current
          ? SPEED.wandering
          : SPEED[motion as 'walking' | 'running']
        const step = Math.min(speed, dist)
        cat.x += (dx / dist) * step
        cat.y += (dy / dist) * step
      } else {
        const isMoving =
          motionRef.current === 'walking' || motionRef.current === 'running'
        if (isMoving && !arriveTimerRef.current) {
          arriveTimerRef.current = setTimeout(() => {
            arriveTimerRef.current = null
            setMotion('idle', dirRef.current)

            if (isWanderingRef.current) {
              // arrived at wander point — occasionally idle, usually go straight to next spot
              if (Math.random() < WANDER_IDLE_CHANCE) {
                scheduleWander()
              } else {
                pickWanderTarget()
              }
            } else {
              // arrived at cursor — wait, then resume wandering
              wanderTimerRef.current = setTimeout(() => {
                wanderTimerRef.current = null
                isWanderingRef.current = true
                pickWanderTarget()
              }, CURSOR_WANDER_DELAY)
            }
          }, 350)
        }
      }

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${cat.x - SIZE / 2}px, ${cat.y - SIZE / 2}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const src = frameListRef.current[frameIdx] ?? frameListRef.current[0]

  return (
    <div
      ref={wrapRef}
      aria-hidden='true'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    >
      <img
        src={src}
        alt=''
        width={SIZE}
        height={SIZE}
        draggable={false}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    </div>
  )
}
