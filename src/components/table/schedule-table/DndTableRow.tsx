"use client";

import {TableRow } from '@/components/ui/table'
import { useSortable } from '@dnd-kit/sortable'
import { Row, Table } from '@tanstack/react-table'
import React, { useEffect, useRef } from 'react'
import {CSS} from '@dnd-kit/utilities';
import { SchedulerMeta, SongHistoryEntry } from '@/types/types'
import { AnimatePresence } from 'framer-motion';
interface DataTableRowProps<TData> {
  row: Row<TData>
  children: React.ReactNode,
  className?: string
}


function DndTableRow<TData>({
  children, 
  row,
}: DataTableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: (row.original as SongHistoryEntry).sort_key});

  
  return (
      <TableRow 
        className='flex items-center justify-left'
        ref={setNodeRef}
        style={{ 
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        {...listeners}
        {...attributes}
      >
        {children}
      </TableRow>
  )
}

export default DndTableRow