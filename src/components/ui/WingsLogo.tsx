type Props = {
  className?: string
  size?: number
  title?: string
}

/** Stylised Wings of Freedom mark — three swept feathers per wing. */
export function WingsLogo({ className, size = 28, title }: Props) {
  const height = (size * 52) / 96
  return (
    <svg
      viewBox="0 0 96 52"
      width={size}
      height={height}
      fill="currentColor"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <Wing />
      <g transform="translate(96,0) scale(-1,1)">
        <Wing />
      </g>
      <path d="M45.4 9.5 L50.6 9.5 L50.6 43 L48 51 L45.4 43 Z" />
    </svg>
  )
}

function Wing() {
  return (
    <g>
      <path d="M44 27.5 C34.5 26 21.5 19.5 6.5 5.5 C18 10 29.5 13.5 38.5 15.5 Z" opacity="0.95" />
      <path d="M43.6 34 C33 32.8 19 26.8 5 14.5 C17 18.8 29.5 21.8 39.2 23 Z" opacity="0.78" />
      <path d="M43.2 40.5 C31.8 40 17.5 35.8 3.5 25.5 C16 29.8 28.5 32.3 40 32.8 Z" opacity="0.58" />
    </g>
  )
}
