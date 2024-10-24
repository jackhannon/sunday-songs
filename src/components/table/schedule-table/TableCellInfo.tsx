"use client";

interface DataTableCellProps {
  getValue: () => string | undefined;
}



function TableCellInfo({ getValue }: DataTableCellProps) {
  const initialValue = getValue();

  return <div className="flex items-center h-8 text-sm">{initialValue}</div>
}

export default TableCellInfo