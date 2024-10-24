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
import { TableRowActions } from "./TableRowActions";
import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { AnimatePresence } from "framer-motion";
import PlaceholderRow from "./PlaceholderRow";
import { deleteSongHistory } from "@/app/actions";

const ScheduleTable = ({
  sunday,
  songs,
  handleNextSunday,
  handlePrevSunday,
  setSundaySongs
}: {
  songs: SongHistoryEntry[], 
  sunday: Date, 
  setSundaySongs: React.Dispatch<React.SetStateAction<SongHistoryEntry[]>>
  handleNextSunday: () => Promise<void>, 
  handlePrevSunday: () => Promise<void>,
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
      removeSong: (historyEntryId: number) => {
        const entryToDelete = songs.find(row => row.id === historyEntryId) as SongHistoryEntry;
    
        setSundaySongs((prevRows) => 
          prevRows.filter(row => row.id !== historyEntryId)
        );
        deleteSongHistory(entryToDelete);
      },
      addNewSong: (song: SongHistoryEntry) => {
        setSundaySongs((prevRows) => [...prevRows, song]);
      }   
    },
  });


  const { setNodeRef, isOver } = useDroppable({
    id: "schedule-table"
  })

  return (
    <div className="grid text-center">
      <div className="space-y-4 flex flex-col relative" style={{maxHeight: "97vh"}}>
        <TableToolbar table={table} />
        
          {isOver && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              Drop Row
            </div>
          )}
          <div 
            ref={setNodeRef} 
            className={`${isOver ? 'bg-accent border-dashed' : 'bg-background'} 
                relative rounded-md border h-full`}
          >
            <Table>
              <TableHeader className="grid sticky top-0 bg-background z-10 mr-4">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow 
                    key={headerGroup.id}
                    className='flex items-center justify-between w-full'
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className='flex items-center justify-left'
                        style={{width: header.getSize()}}
                      >
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
                          <PlaceholderRow
                            key={
                              (row.original as SongHistoryEntry).sort_key + 
                              (row.original as SongHistoryEntry).song.id
                            } 
                            row={row} 
                          >
                            <TableCell>
                              Drop Row Here
                            </TableCell>
                          </PlaceholderRow>
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
                              style={{ top: `${index * 48.5}px` }} // the offset for the row to line up
                            >
                              <TableCell className='flex items-center justify-left'>
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