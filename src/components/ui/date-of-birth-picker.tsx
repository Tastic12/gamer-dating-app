'use client'

import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DateOfBirthPickerProps {
  value?: Date | null
  onChange: (date: Date | null) => void
  minAge?: number
  maxAge?: number
  className?: string
}

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
]

export function DateOfBirthPicker({
  value,
  onChange,
  minAge = 18,
  maxAge = 100,
  className,
}: DateOfBirthPickerProps) {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - maxAge
  const maxYear = currentYear - minAge

  // Generate years array (from maxYear down to minYear for easier selection)
  const years = useMemo(() => {
    const arr = []
    for (let year = maxYear; year >= minYear; year--) {
      arr.push(year)
    }
    return arr
  }, [minYear, maxYear])

  // Get days in selected month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const selectedDay = value?.getDate()
  const selectedMonth = value?.getMonth()
  const selectedYear = value?.getFullYear()

  const daysInMonth = useMemo(() => {
    if (selectedMonth === undefined || selectedYear === undefined) return 31
    return getDaysInMonth(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }, [daysInMonth])

  const handleDayChange = (day: string) => {
    const newDay = parseInt(day)
    const year = selectedYear || maxYear
    const month = selectedMonth ?? 0
    onChange(new Date(year, month, newDay))
  }

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month)
    const year = selectedYear || maxYear
    const day = selectedDay || 1
    // Adjust day if it exceeds days in new month
    const maxDay = getDaysInMonth(newMonth, year)
    const adjustedDay = Math.min(day, maxDay)
    onChange(new Date(year, newMonth, adjustedDay))
  }

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year)
    const month = selectedMonth ?? 0
    const day = selectedDay || 1
    // Adjust day if it exceeds days in month for new year (leap year handling)
    const maxDay = getDaysInMonth(month, newYear)
    const adjustedDay = Math.min(day, maxDay)
    onChange(new Date(newYear, month, adjustedDay))
  }

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {/* Day */}
      <Select
        value={selectedDay?.toString() || ''}
        onValueChange={handleDayChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select
        value={selectedMonth?.toString() || ''}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select
        value={selectedYear?.toString() || ''}
        onValueChange={handleYearChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
