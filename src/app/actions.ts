"use server";

import { HistoryEntry, newSong, Song, SongHistoryEntry } from "@/types/types";
import { createClient } from "@/utils/supabase/server";
import { addSortKeys } from "@/utils/utils";
import { revalidateTag } from "next/cache";

export async function getSongs(lastUseDateToStartFrom: Date): Promise<Song[]> {
  const formattedDate = lastUseDateToStartFrom.toLocaleDateString();

  const supabase = createClient();
  const { data, error } = await supabase
  .rpc('get_songs_with_last_use', { start_date: formattedDate })
  if (error) console.error(error)

  return data || [];
}

export async function deleteSong(id: number) {
  const supabase = createClient();

  const response = await supabase.from('song').delete().eq('id', id);
  revalidateTag("songs");

  return response;
}

export async function updateSong(song: Song) {
  const supabase = createClient();
  const { data, error } = await supabase
  .from('song')
  .update({song_type: song.song_type, occasion: song.occasion, title: song.title, archived: song.archived})
  .eq('id', song.id);

  revalidateTag("songs");

  return {data, error};
}

export async function createSong(song: newSong): Promise<{data: Song, error: unknown}> {
  const supabase = createClient();
  const { data, error } = 
  await supabase
  .from('song')
  .insert({
    song_type: song.song_type,
    occasion: song.occasion,
    title: song.title,
    archived: song.archived
  })
  .select()
  .single();

  revalidateTag("songs");

  return { data, error };
}

export async function getSongsOn(date: string) {
  const supabase = createClient();
  return await supabase.from('song')
  .select()
  .eq('last_used', date)
  .order("id", { ascending: true });
}




//song history functions

export async function getSongsHistoryForDate(date: Date): Promise<SongHistoryEntry[]> {
  const formattedDate = date.toLocaleDateString()
  const supabase = createClient(formattedDate);
  const response = await supabase
  .from('song_history')
  .select(`
    id,
    use_date,
    song ( id, title )
    `)
  .eq('use_date', formattedDate)
  .order('id')
  const data = response.data as unknown as SongHistoryEntry[]

  addSortKeys(data)

  return data;
}

export async function deleteSongHistory(entry: SongHistoryEntry) {
  const supabase = createClient();
  const response = await supabase
  .from('song_history')
  .delete()
  .eq('id', entry.id);

  revalidateTag(entry.use_date);
  
  return response
}

export async function createSongHistory(entry: {song_id: number, use_date: string | Date}): Promise<HistoryEntry> {
  const formattedDate = entry.use_date instanceof Date 
  ? (entry.use_date as Date).toLocaleDateString()
  : entry.use_date;
  
  const supabase = createClient(formattedDate);
  const { data: upsertData, error: upsertError } = await supabase
  .from('song_history')
  .upsert({
    use_date: formattedDate,
    foreign_song_id: entry.song_id
  })
  .select()
  .single();

  revalidateTag(formattedDate);
  revalidateTag("songs")

 if (upsertError) {
    console.error('Error upserting song history:', upsertError);
    throw upsertError;
  }

  if (!upsertData) {
    throw new Error('No data returned after upserting song history');
  }

  addSortKeys([upsertData]);
  return upsertData
}

export async function updateSongHistory(entry: SongHistoryEntry) {

  const supabase = createClient();
  const response = await supabase
  .from('song_history')
  .update({
    foreign_song_id: entry.song.id
  })
  .eq('id', entry.id);

  revalidateTag(entry.use_date);

  return response
}



export async function shiftHistoryEntries(entries: SongHistoryEntry[], direction: 'forward' | 'backward') {
  const supabase = createClient();
  let response;
  if (direction === 'forward') {
    response = Promise.all(
      entries.map(async (entry, index) => {
        const previousIndex = (index - 1 + entries.length) % entries.length;
        return await supabase
          .from('song_history')
          .update({
            foreign_song_id: entries[previousIndex].song.id
          })
          .eq('id', entry.id);
      })
    )
  } else if (direction === 'backward') {
    Promise.all(
      response = entries.map(async (entry, index) => {
        const nextIndex = (index + 1) % entries.length;
        return await supabase
          .from('song_history')
          .update({
            foreign_song_id: entries[nextIndex].song.id
          })
          .eq('id', entry.id);
      })
    )
  }
  revalidateTag(entries[0].use_date);

  return response
}