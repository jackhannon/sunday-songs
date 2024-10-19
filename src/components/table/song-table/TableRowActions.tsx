"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu'
import { Button } from '../../ui/button'
import { CheckIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row, Table } from "@tanstack/react-table"
import { Song, SongsMeta } from '@/types/types'
import { Cross1Icon } from '@radix-ui/react-icons'
interface DataTableRowActionsProps<TData> {
  row: Row<Song>;
  table: Table<TData>
}


export function TableRowActions<TData>({
  row,
  table
}: DataTableRowActionsProps<TData>) {
  const meta = table.options.meta as SongsMeta
  const isArchived = row.original.archived

  const handleDelete = () => {
    meta?.removeRow(row.index);
  }

  const handleEditRow = () => {
    meta?.editRow(row.index)
  }

  const handleArchiveToggle = () => {
    meta?.archiveToggleRow(row.index)
  }

  return (
    <div className='w-20 h-8 ml-auto'>
      {!meta?.editedRows[row.index] && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='ml-auto'>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsHorizontalIcon className='w-4 h-4'/>
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DropdownMenuItem onClick={handleEditRow}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleArchiveToggle}>
              {isArchived ? 'Restore' : 'Archive'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export function TableRowActionsEdit<TData>({
  row,
  table
}: DataTableRowActionsProps<TData>) {
  const meta = table.options.meta as SongsMeta
  const handleDisgardEdit = () => {
    console.log(row.index)
    meta?.finishEdit(row.index, true);
  }

  const handleConfirmEdit = () => {
    meta?.finishEdit(row.index, false)
  }

  return (
    <div className='w-20 h-8 ml-auto'>
      {meta?.editedRows[row.index] && (
        <div className='flex justify-between min-w-20 max-w-20'>
          <Button variant='outline' onClick={handleDisgardEdit} className='p-0 w-8 h-8'>
            <Cross1Icon className='h-4 w-4'/>
          </Button>
          <Button variant='outline' onClick={handleConfirmEdit} className='p-0 w-8 h-8'>
            <CheckIcon className='h-5 w-5'/>
          </Button>
        </div>
      )}
    </div>
  )
}
