
import React from 'react'
import { Lead } from '@/types/database'
import { LeadCard } from './LeadCard'

interface KanbanBoardProps {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
  onLeadStageChange: (leadId: string, newStage: 'lead' | 'contacted' | 'closed') => void
}

export function KanbanBoard({ leads, onLeadClick, onLeadStageChange }: KanbanBoardProps) {
  const stages = [
    { id: 'lead', title: 'Leads', color: 'border-gray-300' },
    { id: 'contacted', title: 'Contacted', color: 'border-blue-300' },
    { id: 'closed', title: 'Closed', color: 'border-green-300' }
  ] as const

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => (lead.raw?.stage || 'lead') === stage)
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, stage: 'lead' | 'contacted' | 'closed') => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    onLeadStageChange(leadId, stage)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pipeline</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id)
          return (
            <div
              key={stage.id}
              className={`border-2 border-dashed ${stage.color} rounded-xl p-4 min-h-[400px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{stage.title}</h4>
                <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="cursor-move"
                  >
                    <LeadCard
                      lead={lead}
                      onClick={() => onLeadClick(lead)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
