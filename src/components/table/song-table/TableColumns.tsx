import { createColumnHelper } from "@tanstack/react-table"
import TableColumnHeader from './TableColumnHeader'
import {TableRowActionsEdit } from "./TableRowActions"
import { Song } from "@/types/types"
import TableCell from "./TableCell";

const columnHelper = createColumnHelper<Song>();

export const columns = [
  columnHelper.accessor('id', {
    header: "ID",
  }),
  columnHelper.accessor('archived', {
    header: "Archived",
    
  }),
  columnHelper.accessor('title', {
    header: ({ column }) => (
      <TableColumnHeader column={column} title={"Title"} />
    ),
    cell: TableCell,
    meta: {
      type: "text",
    },
    size:200
  }),
  columnHelper.accessor('last_use', {
    header: ({ column }) => (
      <TableColumnHeader column={column} title={"Last Used"} />
    ),
    cell: TableCell,
    meta: {
      type: "date",
    },
    enableSorting: true,
    sortingFn: "datetime",
    sortDescFirst: false,
    sortUndefined: "last"
  }),
  columnHelper.accessor('song_type', {
    header: ({ column }) => (
      <TableColumnHeader column={column} title={"Type"} />
    ),
    cell: TableCell,
    meta: {
      type: "select",
      options: [
        { value: "fast", label: "fast" },
        { value: "worship", label: "worship" },
        { value: "powerful", label: "powerful" },
        { value: "service component", label: "service component" },
      ],
    },
    enableSorting: false
  }),
  columnHelper.accessor('occasion', {
    header: ({ column }) => (
      <TableColumnHeader column={column} title={"Occasion"} />
    ),
    cell: TableCell,
    meta: {
      type: "select",
      options: [
        { value: "normal", label: "normal" },
        { value: "christmas", label: "christmas" },
      ],
    },
    enableSorting: false
  }),
  columnHelper.display({
    id: "actions",
    cell: TableRowActionsEdit,
    size: 100
  })
]

