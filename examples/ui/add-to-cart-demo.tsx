import * as React from "react";

import { cn } from "@/lib/utils";
import {
  AddToCartButton,
  CartButton,
  CartProvider,
  useCart,
} from "@/registry/ui/add-to-cart";

const products = [
  {
    art: "from-neutral-200 via-neutral-300 to-neutral-400",
    id: "lamp",
    name: "Aurora Lamp",
    price: 89,
    shape: <circle cx="50" cy="44" r="20" />,
  },
  {
    art: "from-neutral-200 via-neutral-300 to-neutral-400",
    id: "notebook",
    name: "Field Notebook",
    price: 24,
    shape: <rect x="32" y="22" width="36" height="46" rx="4" />,
  },
  {
    art: "from-neutral-200 via-neutral-300 to-neutral-400",
    id: "mug",
    name: "Ceramic Mug",
    price: 32,
    shape: (
      <path d="M30 30h34v26a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12Zm34 6h4a8 8 0 0 1 0 16h-4" />
    ),
  },
];

type Product = (typeof products)[number];

const ProductArt = ({ product }: { product: Product }) => (
  <div
    className={cn(
      "flex size-full items-center justify-center bg-gradient-to-br",
      product.art
    )}
  >
    <svg
      viewBox="0 0 100 90"
      aria-hidden
      className="h-3/5 fill-white/60 stroke-white/80 stroke-2"
    >
      {product.shape}
    </svg>
  </div>
);

const ProductCard = ({ product }: { product: Product }) => {
  const imageRef = React.useRef<HTMLDivElement>(null);
  // A row on narrow screens, a card once three fit side by side.
  return (
    <div className="bg-card text-card-foreground flex items-center gap-3 rounded-xl border p-2 @lg:flex-col @lg:items-stretch @lg:p-3">
      <div
        ref={imageRef}
        className="size-14 shrink-0 overflow-hidden rounded-lg @lg:aspect-[4/3] @lg:size-auto"
      >
        <ProductArt product={product} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-0.5 @lg:flex-row @lg:items-baseline @lg:justify-between">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground text-sm tabular-nums">
          ${product.price}
        </p>
      </div>
      <AddToCartButton
        productId={product.id}
        image={<ProductArt product={product} />}
        source={imageRef}
        className="h-8 shrink-0 px-3 text-xs @lg:w-full @lg:text-sm"
      >
        <span className="@lg:hidden">Add</span>
        <span className="hidden @lg:inline">Add to cart</span>
      </AddToCartButton>
    </div>
  );
};

const Header = () => {
  const { items } = useCart();
  const total = items.reduce(
    (sum, item) =>
      sum +
      item.quantity * (products.find((p) => p.id === item.id)?.price ?? 0),
    0
  );
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold tracking-tight">Studio Goods</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          Subtotal ${total}
        </p>
      </div>
      <CartButton />
    </header>
  );
};

export const AddToCartDemo = () => (
  <CartProvider>
    <div className="@container w-full max-w-xl">
      <div className="flex flex-col gap-4">
        <Header />
        <div className="grid grid-cols-1 gap-2 @lg:grid-cols-3 @lg:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  </CartProvider>
);
