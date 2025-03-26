import { Button } from "@/components/ui/button";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { useSwitchChain } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NetworkSwitch() {
  const { chainName, isConnectedToCorrectChain } = useNetworkInfo();
  const { switchChain } = useSwitchChain();

  const handleSwitchToMoonbase = () => {
    switchChain({ chainId: 1287 });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isConnectedToCorrectChain ? "outline" : "destructive"}
          size="sm"
          className="h-8 px-3 gap-2 font-medium"
        >
          <span
            className={`w-3 h-3 rounded-full ${isConnectedToCorrectChain ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span>{chainName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className={`p-2 ${isConnectedToCorrectChain ? "bg-muted/50" : ""}`}
          onClick={handleSwitchToMoonbase}
          disabled={isConnectedToCorrectChain}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="flex-1">Moonbase Alpha</span>
            {isConnectedToCorrectChain && (
              <span className="text-xs text-muted-foreground">(Current)</span>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
