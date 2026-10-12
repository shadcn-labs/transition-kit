import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/ui/carousel";

const places = [
  {
    art: "radial-gradient(circle at 72% 30%, #fde68a 0 9%, transparent 10%), linear-gradient(180deg, #312e81 0%, #7c3aed 45%, #f472b6 100%)",
    ground: "linear-gradient(180deg, #1e1b4b, #0f0a2e)",
    place: "Lofoten, Norway",
    title: "Aurora Ridge",
  },
  {
    art: "radial-gradient(circle at 28% 34%, #fff7ed 0 8%, transparent 9%), linear-gradient(180deg, #fb923c 0%, #f59e0b 50%, #fde68a 100%)",
    ground: "linear-gradient(180deg, #c2410c, #7c2d12)",
    place: "Wadi Rum, Jordan",
    title: "Copper Dunes",
  },
  {
    art: "radial-gradient(circle at 60% 26%, #ecfeff 0 7%, transparent 8%), linear-gradient(180deg, #0ea5e9 0%, #22d3ee 55%, #a5f3fc 100%)",
    ground: "linear-gradient(180deg, #0369a1, #0c4a6e)",
    place: "Azores, Portugal",
    title: "Tide Pools",
  },
  {
    art: "radial-gradient(circle at 80% 22%, #f7fee7 0 8%, transparent 9%), linear-gradient(180deg, #65a30d 0%, #84cc16 45%, #d9f99d 100%)",
    ground: "linear-gradient(180deg, #166534, #052e16)",
    place: "Yakushima, Japan",
    title: "Moss Canopy",
  },
  {
    art: "radial-gradient(circle at 40% 30%, #fef2f2 0 8%, transparent 9%), linear-gradient(180deg, #7f1d1d 0%, #dc2626 50%, #fb7185 100%)",
    ground: "linear-gradient(180deg, #450a0a, #1c0505)",
    place: "Etna, Italy",
    title: "Ember Fields",
  },
];

export const CarouselDemo = () => (
  <div className="@container w-full">
    <Carousel
      loop
      autoplay={5000}
      aria-label="Featured places"
      className="mx-auto w-full max-w-md"
    >
      <CarouselContent>
        {places.map((place, index) => (
          <CarouselItem
            key={place.title}
            className="bg-card text-card-foreground border"
          >
            <div
              aria-hidden
              className="relative h-36 @md:h-48"
              style={{ background: place.art }}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 [clip-path:polygon(0_45%,18%_10%,34%_40%,52%_0,70%_35%,86%_15%,100%_40%,100%_100%,0_100%)]"
                style={{ background: place.ground }}
              />
            </div>
            <div className="flex items-baseline justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{place.title}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {place.place}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(places.length).padStart(2, "0")}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-between">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  </div>
);
