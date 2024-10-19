"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { SongHistoryEntry } from '@/types/types'
import { columns } from './TableColumns'
import { Table, TableRow, TableHeader, TableHead, TableCell, TableBody } from '../../ui/table'
import { TableToolbar } from './TableToolBar'
import DndTableRow from './DndTableRow'
import DndTableFooter from "./DndTableFooter"
import { TableRowActions } from "./TableRowActions";
import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { AnimatePresence } from "framer-motion";

const ScheduleTable = ({
  sunday,
  songs,
  handleNextSunday,
  handlePrevSunday,
  removeSong,
  addNewSong,
}: {
  songs: SongHistoryEntry[], 
  sunday: Date, 
  handleNextSunday: () => Promise<void>, 
  handlePrevSunday: () => Promise<void>,
  removeSong: (historyEntryId: number) => void, 
  addNewSong: (song: SongHistoryEntry) => void
}) => {
  const table = useReactTable({
    data: songs,
    columns,
    state: {
      columnVisibility: {
        "id": false,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      sunday: sunday,
      setNextSunday: handleNextSunday,
      setPrevSunday: handlePrevSunday,
      removeSong: removeSong,
      addNewSong: addNewSong,
    },
  });


  const { setNodeRef, isOver } = useDroppable({
    id: "schedule-table"
  })

  return (
    <div className="grid text-center">
      <div className='space-y-4 flex flex-col'>
      <TableToolbar table={table} />
      <div ref={setNodeRef} className={`${isOver ? 'bg-accent border-dashed' : 'bg-background'} relative rounded-md border h-full`}>
        {isOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Drop Row
        </div>
        )}
        <Table className="h-full overflow-hidden">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header, 
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        
          <TableBody className="relative">
            <AnimatePresence>
              {table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  {row.original.sort_key === "placeholder" ? (
                    <DndTableRow 
                      key={
                        (row.original as SongHistoryEntry).sort_key + 
                        (row.original as SongHistoryEntry).song.id
                      } 
                      row={row} 
                      className="bg-accent border-dashed"
                    >
                      <TableCell>
                        Drop Row Here
                      </TableCell>
                    </DndTableRow>
                  ) : (
                    <>      
                      <DndTableRow 
                        key={
                          (row.original as SongHistoryEntry).sort_key + 
                          (row.original as SongHistoryEntry).song.id
                        } 
                        row={row}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </DndTableRow>
                      <TableRow 
                        key={
                          "overlay-" + 
                          (row.original as SongHistoryEntry).sort_key + 
                          (row.original as SongHistoryEntry).song.id
                        } 
                        className={`absolute right-0 border-none hover:bg-transparent`}
                        style={{ top: `${index * 49}px` }} // the offset for the row to line up
                      >
                        <TableCell>
                          <TableRowActions row={row} table={table}/>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  )
}

export default ScheduleTable;