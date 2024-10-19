"use client";

import { TableCell, TableRow } from '@/components/ui/table'
import { SongHistoryEntry } from '@/types/types'
import { useDroppable } from '@dnd-kit/core'
import { Column } from '@tanstack/react-table'
import React from 'react'

type props = {
  columns: Column<SongHistoryEntry, unknown>[]
}

const DndTableFooter = ({ columns }: props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "footer-row"
  })

  return (
    <TableRow
      ref={setNodeRef} 
      className={`
        w-full h-12 ${isOver ? "bg-blue-200 border-2 border-blue-400 border-dashed" : ""}
        `}
    >
      <TableCell 
        colSpan={columns.length} 
      >
        Drop item
      </TableCell>
    </TableRow>
  )
}

export default DndTableFooter