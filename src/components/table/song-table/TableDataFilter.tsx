"use client"
import { Column } from '@tanstack/react-table'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Button } from '../../ui/button'
import { PlusCircledIcon, CheckIcon } from '@radix-ui/react-icons'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '../../ui/command'
import { cn } from '../../../lib/utils'
interface DataTableFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: string[]
}


export function TableDataFilter<TData, TValue>({
  column,
  title,
  options
}: DataTableFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[]) 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className='flex gap-2'>
                {Array.from(selectedValues).map((option) => (
                  <Badge
                    key={option}
                    variant="secondary"
                    className="rounded-sm font-normal"
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option)
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option)
                      } else {
                        selectedValues.add(option)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    <span>{option}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}