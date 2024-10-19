"use client";

import { createColumnHelper } from "@tanstack/react-table"

import TableColumnHeader from "./TableColumnHeader";
import { TableRowActions } from "./TableRowActions";
import { SongHistoryEntry } from "@/types/types";
import TableCellInfo from "./TableCellInfo";

const columnHelper = createColumnHelper<SongHistoryEntry>();

export const columns = [
  columnHelper.accessor('id', {
    header: "ID",
  }),
  columnHelper.accessor('song.title', {
    header: ({ column }) => (
      <TableColumnHeader column={column} title={"Title"} />
    ),
    cell: TableCellInfo,
    meta: {
      type: "text",
    },
  }),

]

