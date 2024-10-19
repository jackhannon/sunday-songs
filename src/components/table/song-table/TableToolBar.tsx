"use client"
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Table } from "@tanstack/react-table"
import {Cross2Icon} from '@radix-ui/react-icons'
import {TableDataFilter} from './TableDataFilter'
import {PlusCircledIcon, Cross1Icon} from '@radix-ui/react-icons'
import { Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { PopoverClose } from '@radix-ui/react-popover'
import { FormLabel } from '@/components/ui/form'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { occasions, songTypes } from '@/data/data'
import { SongsMeta } from '@/types/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
interface TableToolbarProps<TData> {
  table: Table<TData>
}

const formSchema = z.object({
  title: z.string().min(2).max(50),
  type: z.enum(["fast", "worship", "powerful", "service component"]),
  occasion: z.enum(["christmas", "normal"]),
  archived: z.boolean(),
})

export function TableToolbar<TData>({
  table,
}: TableToolbarProps<TData>) {
  const meta = table.options.meta as SongsMeta
  const isFiltered = table.getState().columnFilters.length > 0;
 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "powerful",
      occasion: "normal",
      archived: false,
    },
  })


  function onSubmit(data: z.infer<typeof formSchema>) {
    meta.addRow({
      title: data.title, 
      song_type: data.type, 
      occasion: data.occasion,
      archived: false
    });
  }

  const handleArchivedChange = (checked: boolean) => {
    table.getColumn("archived")?.setFilterValue(checked ? true : false);
  };

  return (
    <header className='flex items-center justify-between'>
      <div className="flex flex-1 items-center space-x-2">
        <Input 
          className="h-8 w-[150px] lg:w-[250px]"
          type="text"
          placeholder="Search..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
        />
        {table.getColumn("song_type") && (
          <TableDataFilter
            column={table.getColumn("song_type")}
            title="Type"
            options={songTypes}
          />
        )}
        {table.getColumn("occasion") && (
          <TableDataFilter
            column={table.getColumn("occasion")}
            title="Occasion"
            options={occasions}
          />
        )}
        {table.getColumn("archived") && (
          <div 
            className="inline-flex items-center justify-center whitespace-nowrap font-medium 
              transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
              disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm 
              hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs h-8 border-dashed"
          >
            <Checkbox
              id="archived"
              defaultChecked={false}
              className='mr-2'
              onCheckedChange={handleArchivedChange}
            />
            <Label
              htmlFor="archived"
              className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Archived
            </Label>
          </div>
        )}
          
        {(isFiltered && table.getColumn("archived")?.getFilterValue()) ? (
          <Button 
            variant="ghost" 
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div>
          </div>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className='h-8'>
            Add Song
            <PlusCircledIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-2" align="end">
          <PopoverClose className='absolute right-2 top-2'>
            <Button className='px-1 py-1 w-6 h-6' variant='outline' aria-label='close'>
              <Cross1Icon className='h-4 w-4'/>
            </Button>
          </PopoverClose>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the songs name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      {...field}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an song type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {songTypes.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Occasion</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      {...field}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an occasion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occasions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full mt-2" type="submit">Submit</Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </header>
  )
}


      