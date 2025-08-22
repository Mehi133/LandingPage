
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useLeadsByMonth } from '@/hooks/useLeads'
import { useRealtimeLeads } from '@/hooks/useRealtimeLeads'
import { Lead } from '@/types/database'

interface CalendarProps {
  onDateSelect: (date: string, leads: Lead[]) => void
  selectedDate?: string
}

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  
  const { data: leads = [] } = useLeadsByMonth(year, month)
  
  // Enable realtime updates
  useRealtimeLeads()

  // Group leads by date
  const leadsByDate = leads.reduce((acc, lead) => {
    const date = lead.date_key
    if (!acc[date]) acc[date] = []
    acc[date].push(lead)
    return acc
  }, {} as Record<string, Lead[]>)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const dayLeads = leadsByDate[dateStr] || []
    onDateSelect(dateStr, dayLeads)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month - 1]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-3" />
          }

          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          const dayLeads = leadsByDate[dateStr] || []
          const isSelected = selectedDate === dateStr
          const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString()

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`p-3 text-sm rounded-xl transition-all hover:bg-gray-50 relative ${
                isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'border-2 border-transparent'
              } ${isToday ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{day}</span>
                {dayLeads.length > 0 && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px]">
                    {dayLeads.length}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
