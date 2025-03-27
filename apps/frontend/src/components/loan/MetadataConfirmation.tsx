import { useState } from "react";
import { AiEnhancedLoan } from "@/schemas/loan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Simplified LoanMetadata interface
interface LoanMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  amount: number;
  interestRate: number;
  term: number;
  purpose?: string;
  collateral?: string;
  issuer: string;
  timestamp: number;
  schemaVersion: string;
  riskAssessment?: string;
  riskScore?: number;
}

interface MetadataConfirmationProps {
  enhancedData: AiEnhancedLoan;
  onSubmit: () => void;
  isSubmitting: boolean;
  gasFeeEstimate: string;
  onGasPrioritySelect: (priority: "slow" | "average" | "fast") => void;
  selectedPriority: "slow" | "average" | "fast";
}

export function MetadataConfirmation({
  enhancedData,
  onSubmit,
  isSubmitting,
  gasFeeEstimate,
  onGasPrioritySelect,
  selectedPriority,
}: MetadataConfirmationProps) {
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState("formatted");
  const [showDialog, setShowDialog] = useState(false);

  if (!enhancedData) return null;

  const { original, enhanced } = enhancedData;
  const { loanDetails } = original;

  // Create mock metadata for preview
  const mockMetadata: LoanMetadata = {
    id: `loan-${Date.now()}`,
    name: `Loan Token #${Date.now()}`,
    description: `Loan with ${loanDetails.amount} amount and ${loanDetails.interestRate}% interest rate`,
    image: "ipfs://bafkreihhxcbeaugnqkoxvhcgk4ri3snyavj3jbsgex7kfgwpthbar7v7mq",
    amount: loanDetails.amount,
    interestRate: loanDetails.interestRate,
    term: loanDetails.term,
    purpose: loanDetails.purpose,
    collateral: loanDetails.collateral,
    riskScore: enhanced.riskScore,
    riskAssessment: enhanced.riskAssessment || "Standard Risk",
    issuer: "0x1234567890123456789012345678901234567890", // Mock address
    timestamp: Date.now(),
    schemaVersion: "1.0.0"
  };

  // Get risk color based on assessment
  const getRiskColor = (riskAssessment: string) => {
    if (riskAssessment.toLowerCase().includes("low")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (riskAssessment.toLowerCase().includes("medium") || riskAssessment.toLowerCase().includes("standard")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (riskAssessment.toLowerCase().includes("high")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Confirm Metadata</h2>
        <p className="text-muted-foreground">
          Review the metadata that will be permanently stored on the blockchain and IPFS.
          This information cannot be changed after minting.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Loan Metadata Preview</CardTitle>
          <Badge className={getRiskColor(mockMetadata.riskAssessment || "")}>
            {mockMetadata.riskAssessment}
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="formatted">Formatted View</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatted" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">BASIC INFORMATION</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium">Name:</p>
                      <p className="text-sm">{mockMetadata.name}</p>
                      
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-sm">{mockMetadata.description}</p>
                      
                      <p className="text-sm font-medium">Amount:</p>
                      <p className="text-sm">${mockMetadata.amount.toLocaleString()}</p>
                      
                      <p className="text-sm font-medium">Interest Rate:</p>
                      <p className="text-sm">{mockMetadata.interestRate}%</p>
                      
                      <p className="text-sm font-medium">Term:</p>
                      <p className="text-sm">{mockMetadata.term} months</p>
                      
                      {mockMetadata.purpose && (
                        <>
                          <p className="text-sm font-medium">Purpose:</p>
                          <p className="text-sm">{mockMetadata.purpose}</p>
                        </>
                      )}
                      
                      {mockMetadata.collateral && (
                        <>
                          <p className="text-sm font-medium">Collateral:</p>
                          <p className="text-sm">{mockMetadata.collateral}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">AI ASSESSMENT</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium">Risk Assessment:</p>
                      <p className="text-sm">{mockMetadata.riskAssessment}</p>
                      
                      {mockMetadata.riskScore !== undefined && (
                        <>
                          <p className="text-sm font-medium">Risk Score:</p>
                          <p className="text-sm">{mockMetadata.riskScore}/100</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">BLOCKCHAIN DETAILS</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium">Token ID:</p>
                      <p className="text-sm">{mockMetadata.id}</p>
                      
                      <p className="text-sm font-medium">Issuer:</p>
                      <p className="text-sm truncate">{mockMetadata.issuer}</p>
                      
                      <p className="text-sm font-medium">Creation Date:</p>
                      <p className="text-sm">{new Date(mockMetadata.timestamp).toLocaleString()}</p>
                      
                      <p className="text-sm font-medium">Schema Version:</p>
                      <p className="text-sm">{mockMetadata.schemaVersion}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">GAS DETAILS</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm font-medium">Gas Fee:</p>
                      <p className="text-sm">{gasFeeEstimate}</p>
                      
                      <p className="text-sm font-medium">Priority:</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant={selectedPriority === "slow" ? "default" : "outline"}
                          onClick={() => onGasPrioritySelect("slow")}
                          className="h-7 px-2 text-xs"
                        >
                          Slow
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedPriority === "average" ? "default" : "outline"}
                          onClick={() => onGasPrioritySelect("average")}
                          className="h-7 px-2 text-xs"
                        >
                          Average
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedPriority === "fast" ? "default" : "outline"}
                          onClick={() => onGasPrioritySelect("fast")}
                          className="h-7 px-2 text-xs"
                        >
                          Fast
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowDialog(true)}
                    >
                      View Token Image
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="raw" className="pt-4">
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-xs">{JSON.stringify(mockMetadata, null, 2)}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I understand that this metadata will be permanently stored on the blockchain
              </label>
              <p className="text-sm text-muted-foreground">
                Once minted, the basic properties of this loan token cannot be changed.
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!agreed || isSubmitting}
        >
          {isSubmitting ? "Minting..." : "Mint Loan Token"}
        </Button>
      </div>
      
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Token Image Preview</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <div className="bg-muted rounded-lg p-6 w-64 h-64 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">💰</div>
                <div className="text-lg font-bold text-center">{mockMetadata.name}</div>
                <div className="text-sm text-center mt-2">Amount: ${mockMetadata.amount}</div>
                <div className="text-sm text-center">Rate: {mockMetadata.interestRate}%</div>
                <div className="text-sm text-center">Term: {mockMetadata.term} months</div>
                <div className="mt-4">
                  <Badge className={getRiskColor(mockMetadata.riskAssessment || "")}>
                    {mockMetadata.riskAssessment}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 