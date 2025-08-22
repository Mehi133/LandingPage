
import React from 'react'
import { Grid, List, Kanban } from 'lucide-react'

interface ViewToggleProps {
  view: 'cards' | 'crm' | 'kanban'
  onViewChange: (view: 'cards' | 'crm' | 'kanban') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          view === 'cards'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Grid className="h-4 w-4" />
        Cards
      </button>
      <button
        onClick={() => onViewChange('crm')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          view === 'crm'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="h-4 w-4" />
        CRM
      </button>
      <button
        onClick={() => onViewChange('kanban')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          view === 'kanban'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Kanban className="h-4 w-4" />
        Pipeline
      </button>
    </div>
  )
}
