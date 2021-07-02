import React from 'react'
import { Button } from '@material-ui/core'

export const Action = ({ variant = 'contained', ...props }) => (
  <Button variant={variant} {...props} />
)
