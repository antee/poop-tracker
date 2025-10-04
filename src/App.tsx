import { useMemo, useState } from 'react'
import type { DayState, WeekRange } from './types'
import { addDays, formatIso, formatWeekRange, fromIsoDate, getWeekRangeForDate, listDaysInRange, startOfWeekMonday, toIsoDate, todayIso } from './lib/date'
import { getAllEntries, getDayState, getEarliestDateIso, setDayState, toggleDayState } from './lib/storage'

type WeekBlock = {
  range: WeekRange
  days: string[]
  stats: { P: number; N: number }
}

const EMOJI: Record<DayState, string> = {
  E: '',
  P: '💩',
  N: '❌',
}

function capitalizeFirst(input: string): string {
  if (!input) return input
  return input.charAt(0).toUpperCase() + input.slice(1)
}

function getSwedishWeekdayLabel(iso: string): string {
  const d = fromIsoDate(iso)
  // e.g. "Mån"
  const wd = new Intl.DateTimeFormat('sv-SE', { weekday: 'short' }).format(d)
  return capitalizeFirst(wd)
}

function buildWeeks(): WeekBlock[] {
  const today = new Date()
  const earliestIso = getEarliestDateIso() ?? toIsoDate(today)
  const earliestWeekStart = startOfWeekMonday(fromIsoDate(earliestIso))
  let cursorWeekStart = startOfWeekMonday(today)

  const blocks: WeekBlock[] = []
  const entries = getAllEntries()

  // Iterate weeks from this week back to earliest
  while (cursorWeekStart >= earliestWeekStart) {
    const range = getWeekRangeForDate(cursorWeekStart)
    const days = listDaysInRange(range.startIso, range.endIso)
    let P = 0
    let N = 0
    for (const d of days) {
      const s = entries[d]
      if (s === 'P') P++
      if (s === 'N') N++
    }
    blocks.push({ range, days, stats: { P, N } })
    cursorWeekStart = addDays(cursorWeekStart, -7)
  }
  return blocks
}

function App() {
  const [rev, setRev] = useState(0)
  const weeks = useMemo(() => buildWeeks(), [rev])
  const today = todayIso()

  function onToggleDay(iso: string) {
    toggleDayState(iso)
    setRev((r) => r + 1)
  }

  function onQuickSetToday(state: DayState) {
    setDayState(today, state)
    setRev((r) => r + 1)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md pb-28">
        <header className="px-4 pt-4 pb-2 sticky top-0 backdrop-blur border-b border-gray-100 z-10">
          <h1 className="text-2xl font-semibold">Elis toalettdagbok</h1>
        </header>

        <main className="px-4">
        {weeks.map((w) => (
          <section key={w.range.startIso} className="mt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">{formatWeekRange(w.range)}</h2>
              <div className="text-sm text-gray-600">💩 {w.stats.P} · ❌ {w.stats.N}</div>
            </div>
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg mt-2 overflow-hidden">
              {w.days.map((d) => {
                const s = getDayState(d)
                const isToday = d === today
                return (
                  <li key={d}>
                    <button
                      type="button"
                      onClick={() => onToggleDay(d)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left ${isToday ? 'bg-amber-50' : 'bg-white'} active:opacity-80`}
                      aria-label={`Toggle state for ${formatIso(d, { weekday: 'long', day: '2-digit', month: '2-digit' })}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-12 text-sm text-gray-700">{getSwedishWeekdayLabel(d)}</span>
                        {isToday && <span className="text-xs rounded-full bg-amber-200 text-amber-900 px-2 py-0.5">Idag</span>}
                      </div>
                      <span className="text-2xl leading-none select-none">{EMOJI[s]}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white">
          <div className="mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0)+12px)] pt-2 bg-white/95 backdrop-blur border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-14 rounded-xl text-2xl bg-amber-500 text-white active:opacity-90"
                onClick={() => onQuickSetToday('P')}
                aria-label="Sätt idag till bajs"
              >
                💩
              </button>
              <button
                type="button"
                className="h-14 rounded-xl text-2xl bg-gray-900 text-white active:opacity-90"
                onClick={() => onQuickSetToday('N')}
                aria-label="Sätt idag till inget bajs"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
