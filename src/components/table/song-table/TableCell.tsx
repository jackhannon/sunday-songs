"use client"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Song, SongsMeta } from "@/types/types";
import { Column, Row, Table } from "@tanstack/react-table"
import {  FocusEvent, useEffect, useState } from "react";

interface DataTableCellProps<TData> {
  row: Row<Song>;
  table: Table<TData>
  column: Column<TData>
  getValue: () => string | undefined;
}



function TableCell<TData>({ 
  getValue, 
  row, 
  column,
  table
 }: DataTableCellProps<TData>) {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta
  const tableMeta = table.options.meta as SongsMeta
  const [value, setValue] = useState(initialValue);
  

  let dateForDisplay;
  if (columnMeta?.type === "date") {
    if (initialValue) {
      // If initialValue is in "YYYY-MM-DD", parse it 
      // for display use as "MM/DD/YYYY"
      const dateParts = initialValue.split("-");
      if (dateParts.length === 3) {
        dateForDisplay = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      } else {
        dateForDisplay = value;
      }
    } else {
      dateForDisplay = "N/A"
    }
  } 
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  
  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    tableMeta?.updateRow(row.index, column.id, e.target.value);
  }

  const onSelectChange = (value: string) => {
    tableMeta?.updateRow(row.index, column.id, value);
  }
  
  if (tableMeta?.editedRows[row.index]) {
    return columnMeta?.type === "select" ? (
      <Select
        onValueChange={onSelectChange}
        defaultValue={value}
      >
        <SelectTrigger className="h-8">
          <SelectValue placeholder={`Select a ${column.id}`} />
        </SelectTrigger>
        <SelectContent>
          {columnMeta?.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input 
        className="h-8"
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        onBlur={onBlur}
        type={columnMeta?.type || "text"}
      />
    );
  }

  return <div className="flex items-center text-startwhitespace-nowrap text-sm">{dateForDisplay || value}</div>
}

export default TableCell