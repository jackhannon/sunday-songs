"use client"
import React, { useState } from 'react'
import { columns } from './TableColumns'
import {
  ColumnFiltersState,
  ColumnGrouping,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableRow, TableHeader, TableBody, TableHead, TableCell } from '../../ui/table'
import {TableToolbar} from './TableToolBar'
import { Song, SongsMeta } from '@/types/types'
import {  createSong, deleteSong, updateSong } from '@/app/actions'
import DraggableRow from './DraggableRow'
import { TableRowActions } from './TableRowActions'
import { useOptimisticUpdate } from '@/utils/optimisticUpdate'
const SongsTable = ({
  songs, 
  setSongs,
  handleDragOffSortableRow, 
  handleDragOverSortableRow,
}: {
  songs: Song[]
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>
  handleDragOffSortableRow: (rowKey: string) => void
  handleDragOverSortableRow: (rowKey: string) => void
}) => {
  const [originalData, setOriginalData] = useState(songs || []);
  const [editedRows, setEditedRows] = useState({});
  const table = useReactTable({
    data: songs,
    columns,
    initialState: {
      columnVisibility: {
        id: false,
        archived: false,
      },
      columnFilters: [
        {
          id: "archived",
          value: false,
        }
      ],
      sorting: [
        {
          id: 'last_use', // Sort by the 'last_use' column initially
          desc: false, // Sort in ascending order
        },
      ],
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      handleDragOverSortableRow: handleDragOverSortableRow,
      handleDragOffSortableRow: handleDragOffSortableRow,
      editedRows,
      addRow: async ({ title, occasion, song_type, archived}: Song) => {
        const tempId = Date.now();
    
        // Create a new row with the temporary ID
        const newRow: Song = {
          id: tempId,
          title,
          occasion,
          song_type,
          archived
        };
        await useOptimisticUpdate({
          updateFn: () => setSongs([...songs, newRow]),
          serverAction: () => createSong({title, occasion, song_type, archived}),
          commitFn: (result: Song) => {
            setSongs((songs) => songs.map((item) => (item.id === tempId ? result : item)));
          },
          rollbackFn: () => setSongs(songs.filter((row) => row.id !== tempId)),
        })
      },
      removeRow: async (rowIndex: number) => {
        const song = songs[rowIndex];

        await useOptimisticUpdate({
          updateFn: () => setSongs((prevRows) => prevRows.filter((_row, index) => index !== rowIndex)),
          serverAction: () => deleteSong(songs[rowIndex].id),
          rollbackFn: () => setSongs((prevRows) => [...prevRows.slice(0, rowIndex), song, ...prevRows.slice(rowIndex + 1)]),
        })
      },
      archiveToggleRow: async (rowIndex: number) => {
        const song = songs[rowIndex];

        await useOptimisticUpdate({
          updateFn: () => setSongs((prevRows) => prevRows.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prevRows[rowIndex],
                archived: !song.archived
              }
            }
            return row;
          })),
          serverAction: () => updateSong({...songs[rowIndex], archived: !song.archived }),
          rollbackFn: () => setSongs((prevRows) => prevRows.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prevRows[rowIndex],
                archived: !song.archived
              }
            }
            return row;
          })),
        })
      },

      editRow: (rowIndex: number) => {
        setEditedRows((prevEditingRows) => ({
          ...prevEditingRows,
          [rowIndex]: true,
        }));
      },
      finishEdit: async (rowIndex: number, revert: boolean) => {
        if (revert) {
          setSongs((old) =>
            old.map((row, index) =>
              index === rowIndex ? originalData[rowIndex] : row
            )
          );
        } else {
          const song = songs[rowIndex];
          const originalRow = originalData[rowIndex];
          await useOptimisticUpdate({
            updateFn: () => setOriginalData(
              (old) => old.map((row, index) => (index === rowIndex ? songs[rowIndex] : row))
            ),
            serverAction: () => updateSong(song),
            rollbackFn: () => setOriginalData(
              (old) => old.map((row, index) => (index === rowIndex ? originalRow : row))
            ),
          })
        }
        setEditedRows((prevEditingRows) => ({
          ...prevEditingRows,
          [rowIndex]: false,
        }));
      },

      updateRow: (rowIndex: number, columnId: string, value: string) => {
        setSongs((prevRows) =>
          prevRows.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prevRows[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  const meta = table.options.meta as SongsMeta

  return (
    <div className="grid text-center">
      <div className="flex flex-col gap-4" style={{maxHeight: "97vh"}}>
        <TableToolbar table={table} />
        <div className="relative rounded-md border h-full">
          <Table className='grid'>
            {/* margin is applied to account for scroll bar on the table body */}
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
          
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={Number(row.id)}>
                    {!meta?.editedRows[row.index] ? (
                      <>
                        <DraggableRow table={table} key={`draggable-${row.id}`} row={row} />
                        <TableRow 
                          key={Number(`overlay-${row.id}`)}
                          className={`absolute right-0 border-none hover:bg-transparent`}
                          style={{ top: `${index * 48.5}px` }} // the offset for the row to line up, must be the height of the row
                        >
                          <TableCell
                            className='flex items-center justify-left'
                          >
                            <TableRowActions row={row} table={table}/>
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow key={Number(row.id)} className='flex justify-between'>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            className='flex items-center justify-left'
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow className='flex justify-center items-center'>
                  <TableCell colSpan={columns.length} className='flex items-center'>
                    No Songs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default SongsTable