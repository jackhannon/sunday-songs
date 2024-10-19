"use client"
import { TableBody } from '@/components/ui/table'
import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DataTableBodyProps {
  children: React.ReactNode
}



function DndTableBody({
  children, 
}: DataTableBodyProps) {

  const {
    setNodeRef,
  } = useDroppable({
    id: "schedule-table",
  });
  
  
  return (
    <TableBody
      ref={setNodeRef}
    >
      {children}
    </TableBody>
  )
}

export default DndTableBody