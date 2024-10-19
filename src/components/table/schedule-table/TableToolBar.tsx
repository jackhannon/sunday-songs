"use client";

import { Button } from '../../ui/button'
import { Table } from "@tanstack/react-table"
import {ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons'
import { formatDate } from '@/utils/utils'
import { SchedulerMeta } from '@/types/types'

interface TableToolbarProps<TData> {
  table: Table<TData>
}

export function TableToolbar<TData>({
  table,
}: TableToolbarProps<TData>) {
  const meta = table.options.meta as SchedulerMeta
  const paginateForward = () => {
    meta?.setNextSunday()
  }

  const paginateBackward = () => {
    meta?.setPrevSunday()
  }
  
  return (
    <div className='flex items-center justify-center gap-3 h-8'>
      <Button
        variant={"ghost"}
        onClick={paginateBackward}
      >
        <ChevronLeftIcon className='h-6 w-6'/>
      </Button>
      <h2 className="text-xl font-bold">{formatDate(meta.sunday)}</h2>
      <Button
        variant={"ghost"}
        onClick={paginateForward}
      >
        <ChevronRightIcon className='h-6 w-6'/>
      </Button>
    </div>
  )
}


      