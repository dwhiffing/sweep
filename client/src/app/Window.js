import { h } from 'preact'

export const Window = ({
  active,
  title,
  onClose,
  children,
  className = '',
}) => (
  <div class={`window ${active ? '' : 'hidden'} ${className}`}>
    <div class="title-bar">
      <div class="title-bar-text">
        <img src="./assets/images/icon.png" />
        {title}
      </div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button onClick={onClose} aria-label="Close"></button>
      </div>
    </div>
    {children}
  </div>
)
