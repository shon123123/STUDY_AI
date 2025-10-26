'use client'

import { useEffect, useState } from 'react'

interface ClientDateStringProps {
  date: Date
  locale?: string
  options?: Intl.DateTimeFormatOptions
}

export default function ClientDateString({ 
  date, 
  locale = 'en-US',
  options = {}
}: ClientDateStringProps) {
  const [dateString, setDateString] = useState<string>('')
  
  useEffect(() => {
    setDateString(date.toLocaleDateString(locale, options))
  }, [date, locale, options])

  if (!dateString) {
    return <span>Loading...</span>
  }

  return <span>{dateString}</span>
}