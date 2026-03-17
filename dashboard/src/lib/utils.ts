import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function severityColor(severity: string): {
  text: string
  bg: string
  border: string
  dot: string
} {
  switch (severity) {
    case 'critical':
      return { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400', dot: 'bg-red-400' }
    case 'high':
      return { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400', dot: 'bg-orange-400' }
    case 'warning':
    case 'medium':
      return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400', dot: 'bg-amber-400' }
    case 'low':
      return { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400', dot: 'bg-blue-400' }
    case 'info':
      return { text: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400', dot: 'bg-zinc-400' }
    case 'clean':
      return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400', dot: 'bg-emerald-400' }
    default:
      return { text: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500', dot: 'bg-zinc-500' }
  }
}

export function trustScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function trustScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}
