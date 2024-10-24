"use client";

import { TableRow } from '@/components/ui/table'
import { useSortable } from '@dnd-kit/sortable'
import { Row } from '@tanstack/react-table'
import { DragOverlay } from '@dnd-kit/core'
import { TableBody } from '@/components/ui/table'
import React, { useEffect, useRef, useState } from 'react'
import {CSS} from '@dnd-kit/utilities';
import { SongHistoryEntry } from '@/types/types';

interface DataTableRowProps<TData> {
  row: Row<TData>
  children: React.ReactNode,
}


function PlaceholderRow<TData>({
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

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rowRef.current) {
        const rect = rowRef.current.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        setOffset({
          x: 0,
          y: e.clientY - centerY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  
  return (
      <TableRow 
        ref={(el) => {
          setNodeRef(el);
          if (rowRef) rowRef.current = el;
        }}
        animate={{
          y: offset.y,
        }}
        className={"bg-accent border-dashed h-12"}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...listeners}
        {...attributes}
      >
        {children}
      </TableRow>
  )
}

export default PlaceholderRow