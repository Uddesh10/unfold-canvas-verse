import { forwardRef, type ImgHTMLAttributes } from "react";
import { parsePhoto, type Variant } from "@/lib/photoModel";
import { resolveImageUrl } from "@/lib/imageUrl";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** Either a serialized Photo JSON string or a legacy URL string. */
  photo: string;
  /** Which size variant to render. */
  variant: Variant;
  /** Optional sizes hint for the browser. */
  pictureClassName?: string;
}

/**
 * Renders an image as <picture> with AVIF + WebP sources for modern photos,
 * or a plain <img> for legacy URL-only entries. Always lazy + async decoding.
 */
export const PhotoImg = forwardRef<HTMLImageElement, Props>(
  ({ photo, variant, pictureClassName, loading = "lazy", decoding = "async", ...imgProps }, ref) => {
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
    // Use aspect from full-size dimensions to prevent CLS.
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
