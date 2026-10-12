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
    art: "from-amber-200 via-orange-300 to-rose-400",
    id: "lamp",
    name: "Aurora Lamp",
    price: 89,
    shape: <circle cx="50" cy="44" r="20" />,
  },
  {
    art: "from-sky-200 via-indigo-300 to-violet-400",
    id: "notebook",
    name: "Field Notebook",
    price: 24,
    shape: <rect x="32" y="22" width="36" height="46" rx="4" />,
  },
  {
    art: "from-emerald-200 via-teal-300 to-cyan-400",
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
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border p-2 @md:gap-3 @md:p-3">
      <div ref={imageRef} className="aspect-[4/3] overflow-hidden rounded-lg">
        <ProductArt product={product} />
      </div>
      <div className="flex flex-col gap-0.5 px-0.5 @md:flex-row @md:items-baseline @md:justify-between">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground text-sm tabular-nums">
          ${product.price}
        </p>
      </div>
      <AddToCartButton
        productId={product.id}
        image={<ProductArt product={product} />}
        source={imageRef}
        className="h-8 w-full px-2 text-xs @md:text-sm"
      />
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
        <div className="grid grid-cols-3 gap-2 @md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  </CartProvider>
);
