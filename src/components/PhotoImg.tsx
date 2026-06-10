import { forwardRef, type ImgHTMLAttributes } from "react";
import { parsePhoto, type Variant } from "@/lib/photoModel";
import { resolveImageUrl } from "@/lib/imageUrl";
import { isPendingToken, getPendingPreview } from "@/lib/pendingUploads";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  photo: string;
  variant: Variant;
  pictureClassName?: string;
}

export const PhotoImg = forwardRef<HTMLImageElement, Props>(
  ({ photo, variant, pictureClassName, loading = "lazy", decoding = "async", ...imgProps }, ref) => {
    if (isPendingToken(photo)) {
      const url = getPendingPreview(photo) ?? "";
      return (
        <img
          ref={ref}
          src={url}
          loading={loading}
          decoding={decoding}
          {...imgProps}
        />
      );
    }

    const parsed = parsePhoto(photo);

    if (parsed.kind === "legacy") {
      return (
        <img
          ref={ref}
          src={resolveImageUrl(parsed.url)}
          loading={loading}
          decoding={decoding}
          {...imgProps}
        />
      );
    }

    const v = parsed.photo[variant];
    const width = imgProps.width ?? parsed.photo.w;
    const height = imgProps.height ?? parsed.photo.h;

    return (
      <picture className={pictureClassName}>
        <source srcSet={v.avif} type="image/avif" />
        <source srcSet={v.webp} type="image/webp" />
        <img
          ref={ref}
          src={v.webp}
          loading={loading}
          decoding={decoding}
          width={width}
          height={height}
          {...imgProps}
        />
      </picture>
    );
  }
);
PhotoImg.displayName = "PhotoImg";
