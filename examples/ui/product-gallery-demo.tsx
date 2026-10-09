import { StarIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ProductGallery,
  ProductGalleryMain,
  ProductGalleryThumbnails,
} from "@/registry/ui/product-gallery";
import type { ProductGalleryImage } from "@/registry/ui/product-gallery";

/** A drawn insulated bottle, sized in percent of the shot so it scales with it. */
const Bottle = ({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={cn("absolute flex flex-col items-center", className)}
    style={style}
  >
    <div className="h-[10%] w-[46%] rounded-t-[35%] bg-neutral-900" />
    <div className="h-[4%] w-[52%] bg-neutral-300" />
    <div
      className="w-full flex-1 rounded-[24%/10%] shadow-[0_12px_24px_-8px_rgb(0_0_0/0.45)]"
      style={{
        background: `linear-gradient(90deg, color-mix(in oklab, ${color}, black 35%), ${color} 30%, color-mix(in oklab, ${color}, white 45%) 48%, ${color} 62%, color-mix(in oklab, ${color}, black 40%))`,
      }}
    />
  </div>
);

const Shot = ({
  background,
  children,
}: {
  background: string;
  children: React.ReactNode;
}) => (
  <div className="relative overflow-hidden" style={{ background }}>
    {children}
  </div>
);

const images: ProductGalleryImage[] = [
  {
    alt: "Front view of the Summit bottle in ember orange",
    id: "front",
    node: (
      <Shot background="radial-gradient(circle at 50% 35%, #fde6c8, #f4a259 70%, #c8693a)">
        <div className="absolute bottom-[10%] left-1/2 h-[5%] w-[40%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[2px]" />
        <Bottle
          color="#e8590c"
          className="top-[14%] left-[37%] h-[76%] w-[26%]"
        />
      </Shot>
    ),
  },
  {
    alt: "The bottle tilted on its side against a rose backdrop",
    id: "tilt",
    node: (
      <Shot background="linear-gradient(160deg, #ffe3ec, #f783ac 55%, #c2255c)">
        <Bottle
          color="#e8590c"
          className="top-[16%] left-[38%] h-[70%] w-[24%]"
          style={{ rotate: "-24deg" }}
        />
      </Shot>
    ),
  },
  {
    alt: "Close-up of the leak-proof cap",
    id: "cap",
    node: (
      <Shot background="radial-gradient(circle at 30% 30%, #c3fae8, #20c997 60%, #087f5b)">
        <div className="absolute top-[18%] left-[18%] size-[64%] rounded-full bg-neutral-900 shadow-[0_16px_32px_-8px_rgb(0_0_0/0.5)]" />
        <div className="absolute top-[45%] left-[18%] h-[10%] w-[64%] bg-neutral-300/90" />
        <div className="absolute top-[30%] left-[30%] size-[40%] rounded-full bg-neutral-700" />
        <div className="absolute top-[34%] left-[34%] size-[32%] rounded-full bg-neutral-800" />
      </Shot>
    ),
  },
  {
    alt: "Three colorways side by side: ember, slate and moss",
    id: "colors",
    node: (
      <Shot background="linear-gradient(180deg, #e9ecef, #adb5bd)">
        <Bottle
          color="#e8590c"
          className="top-[24%] left-[14%] h-[60%] w-[20%]"
        />
        <Bottle
          color="#495057"
          className="top-[18%] left-[40%] h-[66%] w-[20%]"
        />
        <Bottle
          color="#5c940d"
          className="top-[24%] left-[66%] h-[60%] w-[20%]"
        />
      </Shot>
    ),
  },
  {
    alt: "The bottle on a rock at sunset",
    id: "outdoors",
    node: (
      <Shot background="linear-gradient(180deg, #4263eb, #9775fa 45%, #ffa94d 75%)">
        <div className="absolute top-[22%] left-[62%] size-[18%] rounded-full bg-amber-200/90" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[#343a40]" />
        <div className="absolute bottom-[22%] left-[14%] h-[14%] w-[54%] rounded-t-[50%] bg-[#495057]" />
        <Bottle
          color="#e8590c"
          className="bottom-[30%] left-[30%] h-[46%] w-[16%]"
        />
      </Shot>
    ),
  },
];

export const ProductGalleryDemo = () => (
  <div className="@container w-full max-w-xl">
    <div className="flex flex-col gap-6 @md:flex-row @md:items-center">
      <ProductGallery
        images={images}
        aria-label="Summit bottle photos"
        className="w-full max-w-64 shrink-0 self-center"
      >
        <ProductGalleryMain />
        <ProductGalleryThumbnails className="*:size-11" />
      </ProductGallery>
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Northline
          </p>
          <h3 className="text-xl font-semibold tracking-tight">
            Summit Insulated Bottle
          </h3>
          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <StarIcon className="size-3.5 fill-current" />
            4.8 · 1,204 reviews
          </div>
        </div>
        <p className="text-2xl font-semibold">
          $38
          <span className="text-muted-foreground text-sm font-normal">
            {" "}
            · 750 ml
          </span>
        </p>
        <p className="text-muted-foreground text-sm">
          Keeps drinks cold for 24 hours and hot for 12. Leak-proof cap,
          powder-coated steel.
        </p>
        <Button className="w-fit">Add to cart</Button>
      </div>
    </div>
  </div>
);
