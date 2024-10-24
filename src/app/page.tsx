import { getSongs, getSongsHistoryForDate } from "./actions";
import { findNextSunday } from "@/utils/utils";
import Tables from "@/components/table/Tables";

export default async function Home() {
  const nextSunday = findNextSunday(new Date())
  const defaultSundaySongs = await getSongsHistoryForDate(nextSunday);

  const data = await getSongs(nextSunday);

  return (
    <main className="p-4 grid grid-cols-2 gap-4 h-screen">
      <Tables songs={data} defaultSundaySongs={defaultSundaySongs} nextSunday={nextSunday}/>
    </main>
  );
}

export const dynamic = 'force-dynamic'
