"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu'
import { Button } from '../../ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row, Table } from "@tanstack/react-table"
import {SchedulerMeta, SongHistoryEntry } from '@/types/types'
interface DataTableRowActionsProps<TData> {
  row: Row<SongHistoryEntry>;
  table: Table<TData>;
}


export function TableRowActions<TData>({
  row,
  table
}: DataTableRowActionsProps<TData>) {
  const tableMeta = table.options.meta as SchedulerMeta
  const handleDelete = () => {
    console.log(row.original.id)
    tableMeta.removeSong(row.original.id)
  }
  return (
    <div className='w-20 ml-auto'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className='ml-auto'>
          <Button
            aria-label='Actions'
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className='w-4 h-4'/>
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

