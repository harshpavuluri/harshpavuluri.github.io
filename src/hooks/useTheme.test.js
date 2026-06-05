import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from './useTheme'

function mockMatchMedia(prefersDark) {
  const listeners = []
  const mq = {
    matches: prefersDark,
    addEventListener: (_event, fn) => listeners.push(fn),
    removeEventListener: (_event, fn) => {
      const i = listeners.indexOf(fn)
      if (i > -1) listeners.splice(i, 1)
    },
    _trigger: (matches) => listeners.forEach((fn) => fn({ matches })),
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mq),
  })
  return mq
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark when system prefers dark and no stored preference', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('defaults to light when system prefers light and no stored preference', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('reads stored preference from localStorage over system preference', () => {
    localStorage.setItem('theme', 'light')
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('sets data-theme attribute on documentElement', () => {
    mockMatchMedia(true)
    renderHook(() => useTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('toggleTheme flips theme and persists to localStorage', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('system preference change updates theme when no localStorage override', () => {
    const mq = mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    act(() => mq._trigger(false))
    expect(result.current.theme).toBe('light')
  })

  it('system preference change does not update when localStorage override exists', () => {
    localStorage.setItem('theme', 'light')
    const mq = mockMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    act(() => mq._trigger(true))
    expect(result.current.theme).toBe('light')
  })
})
