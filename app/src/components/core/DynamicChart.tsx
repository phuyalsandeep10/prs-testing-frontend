"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Dynamic import for Chart component with loading fallback
const Chart = dynamic(
  () => import("@/components/salesperson/Dashboard/Chart"),
  {
    loading: () => (
      <Card className="p-6 h-64 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading chart...</span>
        </div>
      </Card>
    ),
    ssr: false, // Disable SSR for chart components to avoid hydration issues
  }
);

export default Chart;