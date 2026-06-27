import { useSpacesHeroSlidesStore } from "@/hooks/useSpacesHeroSlidesStore";
import { PageHeroEditor } from "@/components/admin/PageHeroEditor";

export const SpacesHeroEditor = () => {
  const { items, set, save, dirty, saving } = useSpacesHeroSlidesStore();
  return (
    <PageHeroEditor
      title="Spaces hero carousel"
      description="Background slides shown at the top of the Spaces page."
      items={items}
      set={set}
      save={save}
      dirty={dirty}
      saving={saving}
    />
  );
};
