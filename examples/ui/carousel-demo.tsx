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
    art: "radial-gradient(circle at 72% 30%, #e4e4e4 0 9%, transparent 10%), linear-gradient(180deg, #353535 0%, #555555 45%, #939393 100%)",
    ground: "linear-gradient(180deg, #1f1f1f, #0e0e0e)",
    place: "Lofoten, Norway",
    title: "Aurora Ridge",
  },
  {
    art: "radial-gradient(circle at 28% 34%, #f8f8f8 0 8%, transparent 9%), linear-gradient(180deg, #a2a2a2 0%, #a6a6a6 50%, #e4e4e4 100%)",
    ground: "linear-gradient(180deg, #595959, #3c3c3c)",
    place: "Wadi Rum, Jordan",
    title: "Copper Dunes",
  },
  {
    art: "radial-gradient(circle at 60% 26%, #fafafa 0 7%, transparent 8%), linear-gradient(180deg, #8a8a8a 0%, #afafaf 55%, #e3e3e3 100%)",
    ground: "linear-gradient(180deg, #575757, #3f3f3f)",
    place: "Azores, Portugal",
    title: "Tide Pools",
  },
  {
    art: "radial-gradient(circle at 80% 22%, #fbfbfb 0 8%, transparent 9%), linear-gradient(180deg, #8b8b8b 0%, #b0b0b0 45%, #ececec 100%)",
    ground: "linear-gradient(180deg, #515151, #242424)",
    place: "Yakushima, Japan",
    title: "Moss Canopy",
  },
  {
    art: "radial-gradient(circle at 40% 30%, #f5f5f5 0 8%, transparent 9%), linear-gradient(180deg, #323232 0%, #4d4d4d 50%, #909090 100%)",
    ground: "linear-gradient(180deg, #171717, #0a0a0a)",
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
