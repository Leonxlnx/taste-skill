const GooeySvgFilter = ({
  id = "gooey-filter",
  strength = 10,
}: {
  id?: string
  strength?: number
}) => {
  return (
    <svg className="hidden absolute">
      <defs>
        <filter id={id}>
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={strength}
            result="blur-sm"
          />
          <feColorMatrix
            in="blur-sm"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export default GooeySvgFilter
