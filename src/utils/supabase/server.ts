import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


export const createFetch =
  (options: Pick<RequestInit, "next" | "cache">, dayTag: string) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
      next: {
        ...options.next,
        tags: [...(options.next?.tags || []), dayTag],
      },
    });
  };


export const createClient = (date?: string) => {
  const dateTag = date ? date : 'songsHistory';

  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({
          next: {
            revalidate: 300,
            tags: ["songs", dateTag],
          },
        }, dateTag),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
