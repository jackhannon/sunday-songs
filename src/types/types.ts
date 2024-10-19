/* eslint-disable @typescript-eslint/no-unused-vars */
import { UniqueIdentifier } from '@dnd-kit/core';
import { RowData, } from '@tanstack/react-table';


export type Song = {
  id: number
  title: string
  last_use?: string
  occasion: string
  song_type: string,
  archived: boolean
}

export type Placeholder = {
  sort_key: "placeholder"
}

export type newSong = {
  title: string
  occasion: string
  song_type: string,
  archived: boolean
}


export type SongHistoryEntry = {
  use_date: string
  id: number
  sort_key: string
  song: {
    id: number
    title: string,
  }
}

export type HistoryEntry = {
  id: number
  sort_key: string
  foreign_song_id: number
  use_date: string
}


export type Option = {
  label: string;
  value: string;
};


export type SchedulerMeta ={
  sunday: Date;
  setNextSunday: () => Promise<void>;
  setPrevSunday: () => Promise<void>;
  removeSong: (rowIndex: number) => void;
  addNewSong: (song: SongHistoryEntry) => void;
};

export type SongsMeta ={
  editedRows: Record<number, boolean>;
  addRow: (newRow: newSong) => void;
  removeRow: (rowId: number) => void;
  updateRow: (rowId: number, columnId: string, value: string) => void;
  editRow: (rowId: number) => void;
  finishEdit: (rowId: number, revert: boolean) => void;
  handleDragOverSortableRow: (rowKey: string) => void;
  handleDragOffSortableRow: () => void;
  archiveToggleRow: (rowIndex: number) => void;
};

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    // Sunday-related properties
    sunday?: Date;
    setNextSunday?: () => Promise<void>;
    setPrevSunday?: () => Promise<void>;
    removeSong?: (rowIndex: number) => void;
    addNewSong?: (song: SongHistoryEntry) => void;
  

    // Row editing functionalities
    editedRows?: Record<number, boolean>;
    addRow?: (newRow: Song) => void;
    removeRow?: (rowId: number) => void;
    updateRow?: (rowId: number, columnId: string, value: string) => void;
    editRow?: (rowId: number) => void;
    finishEdit?: (rowId: number, revert: boolean) => void;
    handleDragOverSortableRow?: (rowKey: string) => void;
    handleDragOffSortableRow?: (rowKey: string) => void;
    archiveToggleRow?: (rowIndex: number) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    type: string;
    options?: Option[];
  }
}