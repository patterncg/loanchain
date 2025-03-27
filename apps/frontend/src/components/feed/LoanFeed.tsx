import { useState, useEffect } from "react";
import { LoanSummary, FeedService } from "@/lib/contract-integration/feed.service";
import { LoanCard } from "./LoanCard";
import { Button } from "@/components/ui/button";

// Loading state component
function LoadingState() {
  return (
    <div className="py-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
      <p className="text-muted-foreground">Loading loans...</p>
    </div>
  );
}

// Empty state component
function EmptyFeedState() {
  return (
    <div className="py-12 text-center">
      <h3 className="text-xl font-semibold mb-2">No loans found</h3>
      <p className="text-muted-foreground mb-6">
        There are currently no active loans available on the platform.
      </p>
    </div>
  );
}

// Load more button component
function LoadMoreButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <div className="flex justify-center mt-8">
      <Button 
        variant="outline" 
        onClick={onClick} 
        disabled={isLoading}
        className="min-w-[150px]"
      >
        {isLoading ? (
          <>
            <span className="mr-2">Loading</span>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}

export function LoanFeed() {
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const feedService = new FeedService();
  
  // Fetch loans on component mount and when page changes
  useEffect(() => {
    async function fetchLoans() {
      try {
        setIsLoading(true);
        const loanData = await feedService.getPaginatedLoans(1, 6);
        setLoans(loanData);
        setHasMore(loanData.length === 6);
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLoans();
  }, []);
  
  // Load more loans when the user clicks the Load More button
  const handleLoadMore = async () => {
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const newLoans = await feedService.getPaginatedLoans(nextPage, 6);
      
      if (newLoans.length > 0) {
        setLoans(prevLoans => [...prevLoans, ...newLoans]);
        setPage(nextPage);
        setHasMore(newLoans.length === 6);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more loans:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (loans.length === 0) {
    return <EmptyFeedState />;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map(loan => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </div>
      
      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore} isLoading={isLoadingMore} />
      )}
    </div>
  );
} 