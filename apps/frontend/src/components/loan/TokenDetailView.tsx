import { useState, useEffect } from "react";
import { LoanMetadata, TokenDetailService } from "@/lib/contract-integration/token-detail.service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetadataDisplay } from "./MetadataDisplay";
import { BlockchainInfo } from "./BlockchainInfo";
import { LoanStatusBadge } from "./LoanStatusBadge";

// Loading state component
function LoadingState() {
  return (
    <div className="py-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
      <p className="text-muted-foreground">Loading loan details...</p>
    </div>
  );
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center">
      <h3 className="text-xl font-semibold mb-2 text-red-500">Error</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
    </div>
  );
}

// Not found state component
function NotFoundState({ tokenId }: { tokenId: string }) {
  return (
    <div className="py-12 text-center">
      <h3 className="text-xl font-semibold mb-2">Loan Not Found</h3>
      <p className="text-muted-foreground mb-6">
        The loan token #{tokenId} could not be found.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
}

// Action buttons component
function ActionButtons({ tokenId, metadata }: { tokenId: string; metadata: LoanMetadata }) {
  // Status determines available actions
  const status = metadata.status || "Active";
  
  // Example functions - these would need to connect to actual contract functions
  const handleRepay = () => {
    console.log(`Repaying loan ${tokenId}`);
    alert("This would repay the loan (not implemented)");
  };
  
  const handleCancel = () => {
    console.log(`Cancelling loan ${tokenId}`);
    alert("This would cancel the loan (not implemented)");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Available actions for this loan:
          </p>
          <div className="flex flex-wrap gap-2">
            {status === "Active" && (
              <>
                <Button onClick={handleRepay}>Repay Loan</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </>
            )}
            {status === "Repaid" && (
              <Button disabled>Loan Repaid</Button>
            )}
            {status === "Defaulted" && (
              <Button variant="destructive" disabled>Loan Defaulted</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TokenDetailViewProps {
  tokenId: string;
}

export function TokenDetailView({ tokenId }: TokenDetailViewProps) {
  const [tokenData, setTokenData] = useState<LoanMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchTokenData() {
      try {
        setIsLoading(true);
        const service = new TokenDetailService();
        const data = await service.getTokenData(tokenId);
        
        setTokenData(data);
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Failed to load token data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTokenData();
  }, [tokenId]);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!tokenData) return <NotFoundState tokenId={tokenId} />;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loan #{tokenId}</h1>
          <p className="text-muted-foreground">
            Created {new Date(tokenData.timestamp || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <LoanStatusBadge status={tokenData.status || "Active"} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <MetadataDisplay metadata={tokenData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Information</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockchainInfo 
              tokenId={tokenId} 
              issuer={tokenData.issuer} 
              timestamp={tokenData.timestamp}
              txHash={tokenData.mintTransactionId}
              blockNumber={tokenData.mintBlockNumber}
            />
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`https://moonbase.moonscan.io/token/${tokenData.id}`, "_blank")}>
                View on Explorer
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(tokenData.metadataUri ? `https://cloudflare-ipfs.com/ipfs/${tokenData.metadataUri.replace('ipfs://', '')}` : '#', "_blank")}>
                View Metadata
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <ActionButtons tokenId={tokenId} metadata={tokenData} />
    </div>
  );
} 