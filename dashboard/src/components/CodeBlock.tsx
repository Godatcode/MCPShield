import { cn } from '../lib/utils'

interface CodeBlockProps {
  data: unknown
  className?: string
}

export function CodeBlock({ data, className }: CodeBlockProps) {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

  return (
    <pre
      className={cn(
        'overflow-auto rounded-lg p-3',
        'bg-[rgba(9,9,11,0.8)] border border-white/[0.04]',
        'font-mono text-xs text-[#a1a1aa] leading-relaxed',
        'max-h-60',
        className
      )}
    >
      <code>{content}</code>
    </pre>
  )
}
