"use client";
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import React, { ReactElement, use, useCallback, useEffect, useState } from 'react'
import SongsTable from './song-table/SongsTable'
import ScheduleTable from './schedule-table/ScheduleTable'
import { Song, SongHistoryEntry } from '@/types/types'
import { findNextSunday, findPreviousSunday } from '@/utils/utils';
import { createSongHistory, deleteSongHistory, getSongs, getSongsHistoryForDate, shiftHistoryEntries} from '@/app/actions';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table, TableBody } from '../ui/table';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';

const Tables = ({defaultSundaySongs, nextSunday, songs: defaultSongs}: {defaultSundaySongs: SongHistoryEntry[], nextSunday: Date, songs: Song[]}) => {

  const [draggedRow, setDraggedRow] = useState<ReactElement | null>(null);
  const [sundaySongs, setSundaySongs] = useState<(SongHistoryEntry)[]>(defaultSundaySongs);
  const [sunday, setSunday] = useState<Date>(nextSunday);
  const [songs, setSongs] = useState<Song[]>(defaultSongs || []);
  const shiftHistoryEntriesForward = (entries: SongHistoryEntry[]) => {
    return entries.map((entry, index, portion) => {
      const previousIndex = (index - 1 + portion.length) % portion.length;
      return {
        ...entry,
        sort_key: portion[previousIndex].sort_key,
        song: {...entries[previousIndex].song}
      }
    })
  }

  const shiftHistoryEntriesBackward = (entries: SongHistoryEntry[]) => {
    return entries.map((entry, index, portion) => {
      const nextIndex = (index + 1) % portion.length;
      return {
        ...entry,
        sort_key: portion[nextIndex].sort_key,
        song: {...entries[nextIndex].song}
      }
    })
  }


  //Triggers when a row from the the left table (SongsTable) is dragged over a row on the right table.
  //Its purpose is to add or move the placeholder row accordingly
  const handleDragOverSortableRow = useCallback((rowKey: string) => {
    setSundaySongs((prev) => {
      const index = prev.findIndex(song => song.sort_key === rowKey);
      const placeholderIndex = prev.findIndex(song => song.sort_key === 'placeholder');
      const placeHolderSong = {sort_key: 'placeholder', use_date: '', song: {id: 0, title: ''}, id: -1};
      
      if (placeholderIndex === -1) {
        // If placeholder doesn't exist, insert it
        return [...prev.slice(0, index), placeHolderSong, ...prev.slice(index)];
      } else if (placeholderIndex !== index) {
        // If placeholder exists but in a different position, move it
        return arrayMove(prev, placeholderIndex, index);
      }
      
      return prev;
    });
  }, []);


  const handleDragOffSortableRow = useCallback(() => {
    setSundaySongs((prev) => {
      const index = prev.findIndex(song => song.sort_key === 'placeholder');
      if (index === -1) return prev;
      const songsWithoutPlaceHolder = [...prev.slice(0, index), ...prev.slice(index + 1)];
      return songsWithoutPlaceHolder;
    });
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      console.log(sunday)
      // the other condition where we will add to the sundaySongs is the one where
      // the sortable prop is not present on the the dropped item
      if (over.id === 'schedule-table') {
        const newSong = songs.find(song => song.id === active.id) as Song;

        const songHistoryRecord = await createSongHistory({song_id: active.id as number, use_date: sunday});
        setSundaySongs(prev => {
          return [
            ...prev,
            {
              use_date: sunday.toLocaleDateString(),
              id: songHistoryRecord.id,
              sort_key: songHistoryRecord.sort_key,
              song: {id: newSong.id, title: newSong.title}
            }
          ]
        });
      } else if (!active.data.current?.sortable) {
        //create a new entry then starting from where it was dropped, 
        //push forward all the songs into the next history slot

        const newSong = songs.find(song => song.id === active.id) as Song;
        const songHistoryRecord = await createSongHistory({song_id: active.id as number, use_date: sunday});
        let updatedPortion: SongHistoryEntry[] = [];
        setSundaySongs(prev => {
          const indexToInsertAt = prev.findIndex(entry => entry.sort_key === over.id);
          const filteredOutPlaceHolder = prev.filter(entry => entry.sort_key !== 'placeholder');
          const preservedPortion = filteredOutPlaceHolder.slice(0, indexToInsertAt);
          const portionToPushForward = filteredOutPlaceHolder.slice(indexToInsertAt);
          const newEntry = {
            id: songHistoryRecord.id,
            use_date: sunday.toLocaleDateString(),
            sort_key: songHistoryRecord.sort_key,
            song: {
              id: newSong.id,
              title: newSong.title,
            },
          };
          updatedPortion = [...portionToPushForward, newEntry];
        
          //rotate them on frontend
          const rotatedPortion = shiftHistoryEntriesForward(updatedPortion);
          return [...preservedPortion, ...rotatedPortion];
        });

        //make calls to push rotate them on backend
        shiftHistoryEntries(updatedPortion, "forward");
      } else {
        // in the case of rearranging exising sortables, we will rotate them either forward or backward
        // depending on if the active sortable is before or after the over sortable
        const oldIndex = sundaySongs.findIndex(entry => entry.sort_key === active.id);
        const newIndex = sundaySongs.findIndex(entry => entry.sort_key === over.id);
        let leftSidePreservedPortion;
        let rightSidePreservedPortion;
        let portion;
        let rotatedPortion;

        if (oldIndex > newIndex) {
          leftSidePreservedPortion = sundaySongs.slice(0, newIndex);
          rightSidePreservedPortion = sundaySongs.slice(oldIndex + 1);
          portion = sundaySongs.slice(newIndex, oldIndex + 1);
          rotatedPortion = shiftHistoryEntriesForward(portion)
          shiftHistoryEntries(portion, "forward");
          setSundaySongs([...leftSidePreservedPortion, ...rotatedPortion, ...rightSidePreservedPortion]);
        } else if (oldIndex < newIndex) {
          leftSidePreservedPortion = sundaySongs.slice(0, oldIndex);
          rightSidePreservedPortion = sundaySongs.slice(newIndex + 1);
          portion = sundaySongs.slice(oldIndex, newIndex + 1);
          rotatedPortion = shiftHistoryEntriesBackward(portion)
          shiftHistoryEntries(portion, "backward");
          setSundaySongs([...leftSidePreservedPortion, ...rotatedPortion, ...rightSidePreservedPortion]);
        }
      }
    }
    setDraggedRow(null);
  };
 
  const handleDragStart = useCallback(async (event: DragEndEvent) => {
    // The `draggedRow` state is only useful to drags that occur from the left
    // table rows.
    if (event.active.data.current?.sortable) return;
    const draggedElement = event.active.data.current as ReactElement;
    setDraggedRow(draggedElement);
  }, [setDraggedRow]);

  const handleNextSunday = useCallback(async () => {
    const nextSunday = findNextSunday(sunday);
    setSunday(nextSunday);
    const newSchedule = await getSongsHistoryForDate(nextSunday);
    setSundaySongs(newSchedule);
    const newSongs = await getSongs(nextSunday);
    setSongs(newSongs);
  }, [sunday, setSunday, setSundaySongs]);


  const handlePrevSunday = useCallback(async () => {
    const prevSunday = findPreviousSunday(sunday);
    setSunday(prevSunday);
    const newSchedule = await getSongsHistoryForDate(prevSunday);
    setSundaySongs(newSchedule);
    const newSongs = await getSongs(nextSunday);
    setSongs(newSongs);
  }, [sunday, setSunday, setSundaySongs]);

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      modifiers={
        draggedRow
        ? []
        : [
            restrictToParentElement, 
            restrictToVerticalAxis
          ]
        }
      >
      <SongsTable 
        songs={songs}
        setSongs={setSongs}
        handleDragOverSortableRow={handleDragOverSortableRow}
        handleDragOffSortableRow={handleDragOffSortableRow}
      />
      <SortableContext 
        items={sundaySongs.map((song) => {
          return {id: song.sort_key}
        })}
        strategy={verticalListSortingStrategy}
      >
        <ScheduleTable 
          sunday={sunday}
          setSundaySongs={setSundaySongs}
          songs={sundaySongs} 
          handleNextSunday={handleNextSunday}
          handlePrevSunday={handlePrevSunday}
        />
      </SortableContext>
      {draggedRow ? (
        
        <DragOverlay>
          <Table>
            <TableBody>
              {draggedRow}
            </TableBody>
          </Table>
        </DragOverlay>
      ): null}
    </DndContext>
  )
}

export default Tables