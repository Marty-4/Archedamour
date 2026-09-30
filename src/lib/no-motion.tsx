import React from 'react'

type MotionOnlyProps = {
  animate?: unknown
  exit?: unknown
  initial?: unknown
  layoutId?: string
  transition?: unknown
  variants?: unknown
  whileHover?: unknown
  whileInView?: unknown
  whileTap?: unknown
}

type AnyProps = React.HTMLAttributes<HTMLElement> & MotionOnlyProps & { children?: React.ReactNode }

const make = (tag: string) => {
  return ({
    children,
    animate,
    exit,
    initial,
    layoutId,
    transition,
    variants,
    whileHover,
    whileInView,
    whileTap,
    ...props
  }: AnyProps) => React.createElement(tag, props, children)
}

export const motion: Record<string, any> = {
  div: make('div'),
  h1: make('h1'),
  h2: make('h2'),
  h3: make('h3'),
  h4: make('h4'),
  h5: make('h5'),
  h6: make('h6'),
  p: make('p'),
  span: make('span'),
  section: make('section'),
  article: make('article'),
  aside: make('aside'),
  header: make('header'),
  footer: make('footer'),
  ul: make('ul'),
  li: make('li'),
  img: make('img'),
  button: make('button'),
  a: make('a'),
  main: make('main'),
  nav: make('nav'),
  form: make('form'),
  input: make('input'),
  label: make('label'),
  blockquote: make('blockquote'),
  cite: make('cite'),
}

export const AnimatePresence = ({ children }: { children?: React.ReactNode; mode?: string }) => <>{children}</>

export default motion
