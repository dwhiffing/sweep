import { h } from 'preact'

export const Icon = ({
  image,
  label,
  onDoubleClick,
  onClick,
  disabled,
  selected,
  className = '',
  textColor = 'white',
}) => {
  return (
    <div
      className={`icon-item ${selected ? 'selected' : ''}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div
        onClick={disabled ? null : onClick}
        onDblClick={disabled ? null : onDoubleClick}
        className={`icon-button relative ${className} `}
      >
        <img alt="icon" src={image} style={{ width: 40 }} />
        <div className="tint" />
        <p
          className="filename"
          style={{ color: selected ? 'white' : textColor }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}
