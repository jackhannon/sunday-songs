"use client";
import { TableCell, TableRow } from '@/components/ui/table'
import { Song, SongsMeta } from '@/types/types';
import { useDraggable } from '@dnd-kit/core';
import { Table } from '@tanstack/react-table';
import { flexRender, Row } from '@tanstack/react-table';
import React, { useEffect, useRef } from 'react'

interface DataTableRowProps {
  row: Row<Song>;
  table: Table<Song>;
}

function DraggableRow({row, table}: DataTableRowProps) {
  const meta = table.options.meta as SongsMeta

  const { attributes, listeners, setNodeRef, over, isDragging } = useDraggable({
    id: row.original.id as number,
    data:
      <TableRow>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
  });
  const hovered = over as {id: string} | undefined
  const currentlyHoveredId = useRef<string>();

  //logic needed to properly toggle the addition, movement, and removal of the placeholder row
  useEffect(() => {
    if (
      hovered?.id 
      && currentlyHoveredId.current !== hovered?.id 
      && isDragging 
      && hovered?.id !== "schedule-table"
    ) {
      if (hovered?.id === "placeholder") {
        currentlyHoveredId.current = hovered?.id;
        return;
      }
 
      meta.handleDragOverSortableRow(hovered?.id);
    
      currentlyHoveredId.current = hovered?.id;
    }

    if (
      currentlyHoveredId.current !== hovered?.id
      && currentlyHoveredId.current
      && (!hovered?.id || hovered?.id === "schedule-table")
      && isDragging
    ) 
    {

      meta.handleDragOffSortableRow();
      currentlyHoveredId.current = undefined;      
    }
   
  }, [hovered?.id]);

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export default DraggableRow