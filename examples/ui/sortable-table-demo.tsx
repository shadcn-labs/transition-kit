import { cn } from "@/lib/utils";
import { SortableTable } from "@/registry/ui/sortable-table";
import type { SortableTableColumn } from "@/registry/ui/sortable-table";

interface Stock {
  id: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
}

const stocks: Stock[] = [
  { change: 1.84, id: "AAPL", marketCap: 3.42, name: "Apple", price: 227.48 },
  {
    change: -0.62,
    id: "MSFT",
    marketCap: 3.11,
    name: "Microsoft",
    price: 418.16,
  },
  { change: 3.27, id: "NVDA", marketCap: 2.98, name: "NVIDIA", price: 121.4 },
  { change: -1.45, id: "AMZN", marketCap: 1.96, name: "Amazon", price: 186.51 },
  {
    change: 0.38,
    id: "GOOGL",
    marketCap: 2.04,
    name: "Alphabet",
    price: 165.86,
  },
  { change: 2.06, id: "META", marketCap: 1.47, name: "Meta", price: 582.77 },
  { change: -2.91, id: "TSLA", marketCap: 0.79, name: "Tesla", price: 249.83 },
  {
    change: 0.12,
    id: "AVGO",
    marketCap: 0.82,
    name: "Broadcom",
    price: 175.32,
  },
];

const usd = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const columns: SortableTableColumn<Stock>[] = [
  {
    accessor: (stock) => stock.id,
    cell: (stock) => (
      <span className="flex items-baseline gap-2">
        <span className="font-medium">{stock.id}</span>
        <span className="text-muted-foreground truncate">{stock.name}</span>
      </span>
    ),
    header: "Company",
    key: "company",
    width: "34%",
  },
  {
    align: "right",
    cell: (stock) => usd.format(stock.price),
    header: "Price",
    key: "price",
  },
  {
    align: "right",
    cell: (stock) => (
      <span
        className={cn(
          stock.change < 0
            ? "text-red-600 dark:text-red-400"
            : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {stock.change > 0 ? "+" : ""}
        {stock.change.toFixed(2)}%
      </span>
    ),
    header: "Change",
    key: "change",
  },
  {
    align: "right",
    cell: (stock) => `$${stock.marketCap.toFixed(2)}T`,
    header: "Mkt cap",
    key: "marketCap",
  },
];

export const SortableTableDemo = () => (
  <SortableTable
    caption="Largest US tech stocks"
    columns={columns}
    rows={stocks}
    defaultSort={{ direction: "desc", key: "marketCap" }}
    searchable
    searchPlaceholder="Filter stocks…"
    searchFn={(stock, query) =>
      `${stock.id} ${stock.name}`.toLowerCase().includes(query.toLowerCase())
    }
    className="max-w-xl"
  />
);
