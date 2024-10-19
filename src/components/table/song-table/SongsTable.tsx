"use client"
import React, { useState } from 'react'
import { columns } from './TableColumns'
import {
  ColumnFiltersState,
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
  handleDragOffSortableRow, 
  handleDragOverSortableRow
}: {
  songs: Song[]
  handleDragOffSortableRow: (rowKey: string) => void
  handleDragOverSortableRow: (rowKey: string) => void
}) => {
  const [data, setData] = useState<Song[]>(songs || []);
  const [originalData, setOriginalData] = useState(songs || []);

  const [editedRows, setEditedRows] = useState({});
  const table = useReactTable({
    data,
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
          updateFn: () => setData([...data, newRow]),
          serverAction: () => createSong({title, occasion, song_type, archived}),
          commitFn: (result: Song) => {
            setData((data) => data.map((item) => (item.id === tempId ? result : item)));
          },
          rollbackFn: () => setData(data.filter((row) => row.id !== tempId)),
        })
      },
      removeRow: async (rowIndex: number) => {
        const song = data[rowIndex];

        await useOptimisticUpdate({
          updateFn: () => setData((prevRows) => prevRows.filter((_row, index) => index !== rowIndex)),
          serverAction: () => deleteSong(data[rowIndex].id),
          rollbackFn: () => setData((prevRows) => [...prevRows.slice(0, rowIndex), song, ...prevRows.slice(rowIndex + 1)]),
        })
      },
      archiveToggleRow: async (rowIndex: number) => {
        const song = data[rowIndex];

        await useOptimisticUpdate({
          updateFn: () => setData((prevRows) => prevRows.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prevRows[rowIndex],
                archived: !song.archived
              }
            }
            return row;
          })),
          serverAction: () => updateSong({...data[rowIndex], archived: !song.archived }),
          rollbackFn: () => setData((prevRows) => prevRows.map((row, index) => {
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
          setData((old) =>
            old.map((row, index) =>
              index === rowIndex ? originalData[rowIndex] : row
            )
          );
        } else {
          const song = data[rowIndex];
          const originalRow = originalData[rowIndex];
          await useOptimisticUpdate({
            updateFn: () => setOriginalData(
              (old) => old.map((row, index) => (index === rowIndex ? data[rowIndex] : row))
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
        setData((prevRows) =>
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
      <div className='space-y-4 flex flex-col'>
        <TableToolbar table={table} />
        <div className="rounded-md border h-full">
          <Table>
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
          
            <TableBody className='relative h-full'>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={Number(row.id)}>
                    {!meta?.editedRows[row.index] ? (
                      <>
                        <DraggableRow table={table} key={`draggable-${row.id}`} row={row} />
                        <TableRow 
                          key={Number(`overlay-${row.id}`)}
                          className={`absolute right-0 border-none hover:bg-transparent`}
                          style={{ top: `${index * 49}px` }} // the offset for the row to line up
                        >
                          <TableCell>
                            <TableRowActions row={row} table={table}/>
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow key={Number(row.id)}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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