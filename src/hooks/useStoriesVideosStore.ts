import { useSiteContent } from "@/hooks/useSiteContent";

const fallback: string[] = [];

export function useStoriesVideosStore() {
  return useSiteContent<string[]>("stories_videos", fallback);
}
