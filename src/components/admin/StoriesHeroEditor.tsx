import { useStoriesHeroSlidesStore } from "@/hooks/useStoriesHeroSlidesStore";
import { PageHeroEditor } from "@/components/admin/PageHeroEditor";

export const StoriesHeroEditor = () => {
  const { items, set, save, dirty, saving } = useStoriesHeroSlidesStore();
  return (
    <PageHeroEditor
      title="Stories hero carousel"
      description="Background slides shown at the top of the Stories page."
      items={items}
      set={set}
      save={save}
      dirty={dirty}
      saving={saving}
    />
  );
};
