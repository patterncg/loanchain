import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

interface GasFeeEstimatorProps {
  baseEstimate?: string;
  baseFeeUsd?: string;
  priorityOptions?: {
    slow: { fee: string; time: string; usd: string };
    average: { fee: string; time: string; usd: string };
    fast: { fee: string; time: string; usd: string };
  };
  onPrioritySelect?: (priority: "slow" | "average" | "fast") => void;
}

export function GasFeeEstimator({
  baseEstimate = "0.00045 ETH",
  baseFeeUsd = "$1.20",
  priorityOptions = {
    slow: { fee: "0.00045 ETH", time: "~5 min", usd: "$1.20" },
    average: { fee: "0.00055 ETH", time: "~2 min", usd: "$1.45" },
    fast: { fee: "0.00065 ETH", time: "~30 sec", usd: "$1.70" },
  },
  onPrioritySelect,
}: GasFeeEstimatorProps) {
  const [selectedPriority, setSelectedPriority] = useState<
    "slow" | "average" | "fast"
  >("average");

  const handlePriorityChange = (priority: "slow" | "average" | "fast") => {
    setSelectedPriority(priority);
    if (onPrioritySelect) {
      onPrioritySelect(priority);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Gas Fee Estimate
          <Tooltip content="Gas fees are payments made to miners to process transactions on the blockchain">
            <span className="h-4 w-4 text-muted-foreground cursor-help inline-flex items-center justify-center rounded-full border border-current">
              <span className="text-xs">i</span>
            </span>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <p>Base Gas Fee</p>
            <div className="flex flex-col items-end">
              <p className="font-medium">{baseEstimate}</p>
              <p className="text-xs text-muted-foreground">{baseFeeUsd}</p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm mb-2 flex items-center gap-1.5">
              Transaction Priority
              <Tooltip content="Higher priority transactions are processed more quickly but cost more">
                <span className="h-4 w-4 text-muted-foreground cursor-help inline-flex items-center justify-center rounded-full border border-current">
                  <span className="text-xs">i</span>
                </span>
              </Tooltip>
            </p>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <PriorityOption
                label="Slow"
                fee={priorityOptions.slow.fee}
                time={priorityOptions.slow.time}
                usd={priorityOptions.slow.usd}
                isSelected={selectedPriority === "slow"}
                onClick={() => handlePriorityChange("slow")}
              />
              <PriorityOption
                label="Average"
                fee={priorityOptions.average.fee}
                time={priorityOptions.average.time}
                usd={priorityOptions.average.usd}
                isSelected={selectedPriority === "average"}
                onClick={() => handlePriorityChange("average")}
              />
              <PriorityOption
                label="Fast"
                fee={priorityOptions.fast.fee}
                time={priorityOptions.fast.time}
                usd={priorityOptions.fast.usd}
                isSelected={selectedPriority === "fast"}
                onClick={() => handlePriorityChange("fast")}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Total Estimated Fee</p>
              <p className="text-xs text-muted-foreground">
                May vary based on network conditions
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-medium">
                {priorityOptions[selectedPriority].fee}
              </p>
              <p className="text-xs text-muted-foreground">
                {priorityOptions[selectedPriority].usd}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PriorityOptionProps {
  label: string;
  fee: string;
  time: string;
  usd: string;
  isSelected: boolean;
  onClick: () => void;
}

function PriorityOption({
  label,
  time,
  usd,
  isSelected,
  onClick,
}: PriorityOptionProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`h-auto py-3 px-3 flex flex-col items-center justify-center gap-1 ${isSelected ? "" : "border-dashed"}`}
      onClick={onClick}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs">{time}</span>
      <span
        className={`text-xs ${isSelected ? "text-white" : "text-muted-foreground"}`}
      >
        {usd}
      </span>
    </Button>
  );
}
