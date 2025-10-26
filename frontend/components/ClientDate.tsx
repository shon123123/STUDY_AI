'use client'

import { useEffect, useState } from 'react'

interface ClientDateProps {
  className?: string
  locale?: string
  options?: Intl.DateTimeFormatOptions
}

export default function ClientDate({ 
  className = '', 
  locale = 'en-US',
  options = {}
}: ClientDateProps) {
  const [date, setDate] = useState<string>('')
  
  useEffect(() => {
    setDate(new Date().toLocaleDateString(locale, options))
  }, [locale, options])

  if (!date) {
    return <span className={className}>Loading...</span>
  }

  return <span className={className}>{date}</span>
}