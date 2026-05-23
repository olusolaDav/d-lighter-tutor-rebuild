'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      richColors
      position="top-right"
      expand={false}
      closeButton
      duration={4000}
      {...props}
    />
  )
}

export { Toaster }
