// Ported from animate-ui.com (Backgrounds / Gradient Background), adapted to
// plain JS + the existing framer-motion setup of this project (no TS, no
// @workspace/ui alias). https://animate-ui.com/docs/components/backgrounds/gradient
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export default function GradientBackground({
  className = '',
  colors = 'from-emerald-400 via-sky-400 to-violet-500',
  transition = { duration: 15, ease: 'easeInOut', repeat: Infinity },
  ...props
}) {
  return (
    <motion.div
      data-slot="gradient-background"
      className={cn('size-full bg-gradient-to-br bg-[length:400%_400%]', colors, className)}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={transition}
      {...props}
    />
  )
}
