import { useMemo } from "react";
import {
  GlobalFilters,
  buildFilters,
  buildTimeDimensions,
} from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Your measures definition would be here...

interface StatsCardsProps {
  globalFilters: GlobalFilters;
}

interface StatsTableRow {
  date: string;
  count: number;
  avgRetailPrice: number;
  avgPromoPrice: number;
  totalRetailPrice: number;
  totalPromoPrice: number;
  retailPriceCount: number;
  promoPriceCount: number;
  minRetailPrice: number;
  minPromoPrice: number;
  maxRetailPrice: number;
  maxPromoPrice: number;
  medianRetailPrice: number;
  medianPromoPrice: number;
  averageDiscountPercentage: number;
}

function processStatsTableData(resultSet: any, granularity: string = "day"): StatsTableRow[] {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    return pivot.map((row: any) => {
      const dateKey = `prices.price_date.${granularity}`;
      const dateValue = row[dateKey];
      const formattedDate = dateValue
        ? new Date(dateValue as string).toLocaleDateString()
        : "N/A";

      return {
        date: formattedDate,
        count: Number(row["prices.count"]),
        avgRetailPrice: Number(row["prices.averageRetailPrice"]),
        avgPromoPrice: Number(row["prices.averagePromoPrice"]),
        totalRetailPrice: Number(row["prices.totalRetailPrice"]),
        totalPromoPrice: Number(row["prices.totalPromoPrice"]),
        retailPriceCount: Number(row["prices.retailPriceCount"]),
        promoPriceCount: Number(row["prices.promoPriceCount"]),
        minRetailPrice: Number(row["prices.minRetailPrice"]),
        minPromoPrice: Number(row["prices.minPromoPrice"]),
        maxRetailPrice: Number(row["prices.maxRetailPrice"]),
        maxPromoPrice: Number(row["prices.maxPromoPrice"]),
        medianRetailPrice: Number(row["prices.medianRetailPrice"]),
        medianPromoPrice: Number(row["prices.medianPromoPrice"]),
        averageDiscountPercentage: Number(row["prices.averageDiscountPercentage"]),
      };
    });
  } catch (error) {
    console.error("Error processing stats table data:", error);
    return [];
  }
}

export function StatsCardsTable({ globalFilters }: StatsCardsProps) {
  const { resultSet, isLoading, error } = useStableQuery(
    () => ({
      measures: [
        "prices.count",
        "prices.averageRetailPrice",
        "prices.averagePromoPrice",
        "prices.totalRetailPrice",
        "prices.totalPromoPrice",
        "prices.retailPriceCount",
        "prices.promoPriceCount",
        "prices.minRetailPrice",
        "prices.minPromoPrice",
        "prices.maxRetailPrice",
        "prices.maxPromoPrice",
        "prices.medianRetailPrice",
        "prices.medianPromoPrice",
        "prices.averageDiscountPercentage",
      ],
      dimensions: [],
      filters: buildFilters(globalFilters),
      timeDimensions: buildTimeDimensions(
        globalFilters.datePreset,
        globalFilters.granularity
      ),
    }),
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "stats-table"
  );

  const tableData = useMemo(() => {
    return processStatsTableData(resultSet, globalFilters.granularity);
  }, [resultSet, globalFilters.granularity]);

  // Helper functions for formatting
  const formatCurrency = (value: number) => `${value.toFixed(2)} лв`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  // Define table columns
  const columns: ColumnDef<StatsTableRow>[] = [
    {
      accessorKey: "date",
      header: "Date", // Changed header for clarity
      cell: ({ row }) => (
        <div className="font-medium whitespace-nowrap">
          {row.getValue("date")}
        </div>
      ),
    },
    {
      accessorKey: "count",
      header: "Count",
      cell: ({ row }) => formatNumber(row.getValue("count")),
    },
    {
      accessorKey: "avgRetailPrice",
      header: "Avg Retail",
      cell: ({ row }) => formatCurrency(row.getValue("avgRetailPrice")),
    },
    {
      accessorKey: "avgPromoPrice",
      header: "Avg Promo",
      cell: ({ row }) => formatCurrency(row.getValue("avgPromoPrice")),
    },
    {
      accessorKey: "minRetailPrice",
      header: "Min Retail",
      cell: ({ row }) => formatCurrency(row.getValue("minRetailPrice")),
    },
    {
      accessorKey: "maxRetailPrice",
      header: "Max Retail",
      cell: ({ row }) => formatCurrency(row.getValue("maxRetailPrice")),
    },
    {
      accessorKey: "minPromoPrice",
      header: "Min Promo",
      cell: ({ row }) => formatCurrency(row.getValue("minPromoPrice")),
    },
    {
      accessorKey: "maxPromoPrice",
      header: "Max Promo",
      cell: ({ row }) => formatCurrency(row.getValue("maxPromoPrice")),
    },
    {
      accessorKey: "medianRetailPrice",
      header: "Median Retail",
      cell: ({ row }) => formatCurrency(row.getValue("medianRetailPrice")),
    },
    {
      accessorKey: "medianPromoPrice",
      header: "Median Promo",
      cell: ({ row }) => formatCurrency(row.getValue("medianPromoPrice")),
    },
    {
      accessorKey: "totalRetailPrice",
      header: "Total Retail",
      cell: ({ row }) => formatCurrency(row.getValue("totalRetailPrice")),
    },
    {
      accessorKey: "totalPromoPrice",
      header: "Total Promo",
      cell: ({ row }) => formatCurrency(row.getValue("totalPromoPrice")),
    },
    {
      accessorKey: "retailPriceCount",
      header: "Retail Records",
      cell: ({ row }) => formatNumber(row.getValue("retailPriceCount")),
    },
    {
      accessorKey: "promoPriceCount",
      header: "Promo Records",
      cell: ({ row }) => formatNumber(row.getValue("promoPriceCount")),
    },
    {
      accessorKey: "averageDiscountPercentage",
      header: "Avg Discount",
      cell: ({ row }) =>
        formatPercentage(row.getValue("averageDiscountPercentage")),
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // The rest of your component's rendering logic is correct...
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading statistics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error loading data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
