
import { cva } from '../../utils/cx.js';

export const triggerVariants = cva({
  base: [
    'group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
    'text-accent-sm',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  variants: {
    size: {
      sm: 'text-body-sm',
      default: 'text-body-sm lg:text-body',
      lg: 'text-body lg:text-body-lg',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const chevronWrapperVariants = cva({
  base: [
    'flex items-center justify-center',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]',
  ],
  variants: {
    size: {
      sm: 'size-32 lg:size-40',
      default: 'size-40 lg:size-48',
      lg: 'size-48 lg:size-56',
    },
    position: {
      left: 'origin-left -rotate-45 scale-0',
      right: 'absolute right-0 z-10 origin-right rotate-0 scale-100',
    },
    theme: {
      light: 'bg-foreground text-background',
      dark: 'bg-foreground text-background',
      brand: 'bg-brand text-black',
    },
  },
  defaultVariants: {
    size: 'default',
    theme: 'light',
  },
});

export const labelVariants = cva({
  base: [
    'flex w-full flex-1 items-center justify-center gap-8',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]',
  ],
  variants: {
    size: {
      sm: 'h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12',
      default: 'h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16',
      lg: 'h-48 -translate-x-[calc(48px+6px)] px-16 lg:h-56 lg:-translate-x-[calc(56px+6px)] lg:px-24',
    },
    theme: {
      light: 'bg-foreground text-background',
      dark: 'bg-foreground text-background',
      brand: 'bg-brand text-black',
    },
  },
  defaultVariants: {
    size: 'default',
    theme: 'light',
  },
});