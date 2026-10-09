"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

interface ProductGalleryImage {
  id: string;
  alt: string;
  /** Image URL. Rendered as an `<img>` with `object-fit: cover`. */
  src?: string;
  /** Custom content instead of `src`. It should fill its box. */
  node?: React.ReactNode;
}

interface ProductGalleryContextValue {
  images: ProductGalleryImage[];
  index: number;
  name: TransitionNames;
  select: (index: number) => void;
}

const ProductGalleryContext =
  React.createContext<ProductGalleryContextValue | null>(null);

const useProductGallery = () => {
  const context = React.useContext(ProductGalleryContext);
  if (!context) {
    throw new Error(
      "ProductGallery parts must be used within <ProductGallery>."
    );
  }
  return context;
};

const wrap = (index: number, count: number) =>
  ((index % count) + count) % count;

/** Decodes an image before the swap, so the new hero snapshot is never blank. */
const decodeImage = async (src?: string) => {
  if (!src || typeof Image === "undefined") {
    return;
  }
  const image = new Image();
  image.src = src;
  await image.decode().catch(() => null);
};

const IMAGE = ["tk-morph", "tk-clip", "tk-product-gallery-image"] as const;

const ProductGallery = ({
  images,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  images: ProductGalleryImage[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const request = React.useRef(0);
  const name = useTransitionNames();
  const count = images.length;
  const index = count
    ? Math.min(Math.max(indexProp ?? uncontrolled, 0), count - 1)
    : 0;

  const select = React.useCallback(
    (next: number) => {
      if (!count) {
        return;
      }
      const target = wrap(next, count);
      // A newer request (even a no-op one) cancels any swap still waiting.
      request.current += 1;
      const token = request.current;
      if (target === index) {
        return;
      }
      const swap = async () => {
        await decodeImage(images[target]?.src);
        if (token !== request.current) {
          return;
        }
        startTransition(() => {
          setUncontrolled(target);
          onIndexChange?.(target);
        });
      };
      void swap();
    },
    [count, images, index, onIndexChange]
  );

  const context = React.useMemo(
    () => ({ images, index, name, select }),
    [images, index, name, select]
  );

  return (
    <ProductGalleryContext.Provider value={context}>
      <div
        data-slot="product-gallery"
        className={cn("flex flex-col gap-3", className)}
        {...props}
      />
    </ProductGalleryContext.Provider>
  );
};

const ProductGalleryMedia = ({
  image,
  decorative = false,
  className,
}: {
  image: ProductGalleryImage;
  decorative?: boolean;
  className?: string;
}) =>
  image.src ? (
    <img
      src={image.src}
      alt={decorative ? "" : image.alt}
      draggable={false}
      data-slot="product-gallery-media"
      className={cn("size-full object-cover", className)}
    />
  ) : (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : image.alt}
      aria-hidden={decorative || undefined}
      data-slot="product-gallery-media"
      className={cn("size-full *:size-full", className)}
    >
      {image.node}
    </div>
  );

const controlClass =
  "bg-background/90 text-foreground absolute top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-sm outline-none transition-colors hover:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-4";

const ProductGalleryMain = ({
  controls = true,
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  /** Show previous / next buttons over the image. */
  controls?: boolean;
}) => {
  const { images, index, name, select } = useProductGallery();
  const image = images[index];
  const count = images.length;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (step === undefined || event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    select(index + step);
  };

  return (
    <div
      data-slot="product-gallery-main"
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-muted relative aspect-square w-full overflow-hidden rounded-(--tk-ui-product-gallery-radius)",
        className
      )}
      {...props}
    >
      {image ? (
        // The selected image wears its shared name here; its thumbnail slot
        // doesn't, so the two swap places as one element each.
        <ViewTransition
          key={image.id}
          name={name("image", image.id)}
          default="none"
          share={tk(...IMAGE, "tk-top", "tk-product-gallery-hero")}
        >
          <ProductGalleryMedia image={image} className="absolute inset-0" />
        </ViewTransition>
      ) : null}
      {controls && count > 1 ? (
        <>
          {/* After the images, so the swap never covers them. */}
          <ViewTransition
            default="none"
            update={tk("tk-morph", "tk-product-gallery-control")}
          >
            <button
              type="button"
              aria-label="Previous image"
              aria-controls={name("thumbnails")}
              data-slot="product-gallery-previous"
              onClick={() => select(index - 1)}
              className={cn(controlClass, "left-2")}
            >
              <ChevronLeftIcon />
            </button>
          </ViewTransition>
          <ViewTransition
            default="none"
            update={tk("tk-morph", "tk-product-gallery-control")}
          >
            <button
              type="button"
              aria-label="Next image"
              aria-controls={name("thumbnails")}
              data-slot="product-gallery-next"
              onClick={() => select(index + 1)}
              className={cn(controlClass, "right-2")}
            >
              <ChevronRightIcon />
            </button>
          </ViewTransition>
        </>
      ) : null}
      <p aria-live="polite" aria-atomic className="sr-only">
        {image ? `${image.alt}, image ${index + 1} of ${count}` : null}
      </p>
    </div>
  );
};

const ProductGalleryThumbnails = ({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) => {
  const { images, index, name, select } = useProductGallery();
  const groupRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const target = {
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      End: images.length - 1,
      Home: 0,
    }[event.key];
    if (target === undefined || event.defaultPrevented || !images.length) {
      return;
    }
    event.preventDefault();
    const next = wrap(target, images.length);
    select(next);
    groupRef.current
      ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
      ?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Product images"
      id={name("thumbnails")}
      data-slot="product-gallery-thumbnails"
      onKeyDown={handleKeyDown}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      {images.map((image, position) => {
        const selected = position === index;
        return (
          <button
            key={image.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={image.alt}
            tabIndex={selected ? 0 : -1}
            data-index={position}
            data-state={selected ? "checked" : "unchecked"}
            data-slot="product-gallery-thumbnail"
            onClick={() => select(position)}
            className="bg-muted relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-(--tk-ui-product-gallery-thumb-radius) outline-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-transparent after:transition-colors hover:after:border-border focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:after:border-foreground"
          >
            {/* The selected slot keeps a faint placeholder while its image is
                in the hero; the others carry the shared name, so the image
                leaving the hero shrinks back into its slot. */}
            {selected ? (
              <ProductGalleryMedia
                image={image}
                decorative
                className="absolute inset-0 opacity-30"
              />
            ) : (
              <ViewTransition
                name={name("image", image.id)}
                default="none"
                share={tk(...IMAGE, "tk-product-gallery-leaving")}
              >
                <ProductGalleryMedia
                  image={image}
                  decorative
                  className="absolute inset-0"
                />
              </ViewTransition>
            )}
          </button>
        );
      })}
    </div>
  );
};

export { ProductGallery, ProductGalleryMain, ProductGalleryThumbnails };
export type { ProductGalleryImage };
