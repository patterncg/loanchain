import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanForm, loanFormSchema, AiEnhancedLoan } from "@/schemas/loan";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loanApi } from "@/lib/api";
import { useContractIntegration } from "@/lib/contract";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EnhancedLoanData } from "../../lib/contract-integration/types";
import { TransactionNotification } from "@/components/transaction/TransactionNotification";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionStatus } from "@/lib/contract-integration/transaction.service";

import { LoanDetailsForm } from "./LoanDetailsForm";
import { MetadataConfirmation } from "./MetadataConfirmation";

// Default values for the form
const defaultValues: LoanForm = {
  loanDetails: {
    amount: 0,
    interestRate: 0,
    term: 0,
  },
};

// Steps in the wizard
const steps = [
  { id: "loan-details", label: "Loan Details" },
  { id: "confirmation", label: "Confirm" },
];

export function LoanCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiEnhancedData, setAiEnhancedData] = useState<AiEnhancedLoan | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gasFeeEstimate, setGasFeeEstimate] = useState("0.00055 ETH ($1.45)");
  const [selectedPriority, setSelectedPriority] = useState<
    "slow" | "average" | "fast"
  >("average");
  const [hasMinterRole, setHasMinterRole] = useState<boolean | null>(null);

  const { toast } = useToast();
  const {
    metadataService,
    error: contractError,
    checkMinterRole,
    estimateGasFee,
    walletAddress,
  } = useContractIntegration();
  
  const { 
    mintLoanToken, 
    currentTransaction, 
    isLoading: isTransactionLoading, 
    clearCurrentTransaction 
  } = useTransaction();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoanForm>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit, reset, trigger, getValues } = form;

  // Check if user has minter role
  useEffect(() => {
    const checkRole = async () => {
      if (walletAddress) {
        const hasRole = await checkMinterRole();
        setHasMinterRole(hasRole);
      } else {
        setHasMinterRole(null);
      }
    };

    checkRole();
  }, [walletAddress, checkMinterRole]);

  // Fetch gas fee estimate when on confirmation step
  useEffect(() => {
    const getGasEstimate = async () => {
      if (currentStep === 1 && walletAddress) {
        const baseEstimate = await estimateGasFee();
        updateGasFeeEstimate(selectedPriority, baseEstimate);
      }
    };

    getGasEstimate();
  }, [currentStep, walletAddress, estimateGasFee, selectedPriority]);

  // Progress calculation
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle next step navigation
  const handleNextStep = async () => {
    // Validate the current step's fields before proceeding
    const isStepValid = await trigger();

    if (isStepValid) {
      if (currentStep === 0) {
        // Analyze the loan data first
        await handleAnalyzeLoan();
        // Then move to confirmation step
        setCurrentStep(1);
      }
    }
  };

  // Handle previous step navigation
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(0);
    }
  };

  // Analyze loan data with AI
  const handleAnalyzeLoan = async () => {
    try {
      setIsAnalyzing(true);
      const loanData = getValues();

      // Call the API to enhance the loan data or create a simple enhancement
      try {
        const enhancedData = await loanApi.enhanceLoan(loanData);
        setAiEnhancedData(enhancedData);
      } catch (error) {
        // If AI enhancement fails, create a simple enhancement
        console.warn("AI enhancement failed, using simple enhancement", error);

        // Create a fallback enhancement with basic risk assessment
        const fallbackEnhancement: AiEnhancedLoan = {
          original: loanData,
          enhanced: {
            riskScore: 50,
            riskAssessment: "Standard loan with medium risk.",
          },
        };

        setAiEnhancedData(fallbackEnhancement);
      }
    } catch (error) {
      console.error("Error analyzing loan:", error);
      toast({
        title: "Error",
        description: "Failed to analyze loan data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update gas fee estimate based on selected priority
  const updateGasFeeEstimate = (
    priority: "slow" | "average" | "fast",
    baseEstimate: number = 0.002,
  ) => {
    const multipliers = {
      slow: 0.8,
      average: 1.0,
      fast: 1.2,
    };

    const fee = baseEstimate * multipliers[priority];
    // Calculate approximate USD value (simplified)
    const usdValue = fee * 2500; // Assuming 1 ETH = $2500

    setGasFeeEstimate(`${fee.toFixed(5)} ETH ($${usdValue.toFixed(2)})`);
  };

  // Handle form submission (mint loan token)
  const onSubmit = async () => {
    if (!aiEnhancedData) {
      toast({
        title: "Error",
        description: "No loan data available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create metadata from the loan data and enhanced data
      const loanMetadata: EnhancedLoanData = {
        // Core loan data
        amount: aiEnhancedData.original.loanDetails.amount,
        interestRate: aiEnhancedData.original.loanDetails.interestRate,
        term: aiEnhancedData.original.loanDetails.term,
        // Required fields with default values if not provided
        purpose:
          aiEnhancedData.original.loanDetails.purpose || "General purpose",
        collateralType: aiEnhancedData.original.loanDetails.collateral
          ? "Generic"
          : "None",
        collateralValue: aiEnhancedData.original.loanDetails.collateral
          ? 1000
          : 0,
        // Required metadata fields
        id: `loan-${Date.now()}`,
        issuer: walletAddress || "0x0000000000000000000000000000000000000000",
        timestamp: Date.now(),
        // AI enhanced fields - map to corresponding fields in EnhancedLoanData
        aiSummary:
          aiEnhancedData.enhanced.riskAssessment ||
          "No risk assessment available",
        riskTag: aiEnhancedData.enhanced.riskScore
          ? `Risk ${aiEnhancedData.enhanced.riskScore}`
          : "Unknown risk",
        // Optional document URL
        loanTermsDocumentUrl: "https://example.com/terms",
      };

      // Check if metadataService is available for metadata storage
      let metadataUri = '';
      
      if (metadataService) {
        // Upload metadata to IPFS first
        metadataUri = await metadataService.uploadMetadata(loanMetadata);
      } else {
        // Mock metadata URI in development environment
        console.log("Metadata service unavailable, using mock URI");
        metadataUri = `ipfs://mock/${Date.now()}`;
      }
      
      // Mint the token using the transaction service if wallet is connected
      if (walletAddress) {
        await mintLoanToken(walletAddress, metadataUri, loanMetadata);
        
        // After successful submission, show the transaction notification but don't reset form yet
        // Form will be reset once transaction completes successfully
      } else {
        throw new Error("Wallet address not available");
      }
    } catch (error) {
      console.error("Error submitting loan:", error);
      toast({
        title: "Error",
        description: `Failed to mint loan token: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Handle transaction completion (reset form on success)
  useEffect(() => {
    if (currentTransaction?.status === TransactionStatus.SUCCESS) {
      // Reset form after successful transaction
      reset(defaultValues);
      setCurrentStep(0);
      setAiEnhancedData(null);
      setIsSubmitting(false);
      
      // Show success toast
      toast({
        title: "Success!",
        description: `Loan token minted successfully. Transaction confirmed.`,
      });
      
      // Note: Redirect is now handled directly by the useTransaction hook,
      // which will automatically redirect to the token detail page after
      // a brief delay to let the user see the success notification.
    } else if (currentTransaction?.status === TransactionStatus.FAILED) {
      // Just reset the submitting state on failure (toast is handled by the hook)
      setIsSubmitting(false);
    }
  }, [currentTransaction, reset, toast]);

  // Handle gas priority selection
  const handleGasPrioritySelect = (priority: "slow" | "average" | "fast") => {
    setSelectedPriority(priority);
    updateGasFeeEstimate(priority);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <LoanDetailsForm />;
      case 1:
        return (
          <MetadataConfirmation
            enhancedData={aiEnhancedData}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting || isTransactionLoading}
            gasFeeEstimate={gasFeeEstimate}
            onGasPrioritySelect={handleGasPrioritySelect}
            selectedPriority={selectedPriority}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Create Loan Token</h1>
        <p className="text-muted-foreground">
          Fill in the loan details to generate a new loan token on the
          blockchain.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{currentStep + 1} of {steps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Transaction notification */}
      {currentTransaction && (
        <div className="mb-4">
          <TransactionNotification
            status={currentTransaction.status}
            type={currentTransaction.type}
            hash={currentTransaction.hash}
            error={currentTransaction.error}
            onDismiss={clearCurrentTransaction}
          />
        </div>
      )}

      {/* Contract error banner */}
      {contractError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{contractError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <FormProvider {...form}>
          <form>
            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0 || isSubmitting || isTransactionLoading}
              >
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isAnalyzing || isSubmitting || isTransactionLoading}
                >
                  {isAnalyzing ? "Analyzing..." : "Next"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || isTransactionLoading || !hasMinterRole}
                >
                  {isSubmitting || isTransactionLoading ? "Minting..." : "Mint Loan Token"}
                </Button>
              )}
            </div>

            {/* Role permission message */}
            {hasMinterRole === false && currentStep === steps.length - 1 && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Permission Denied</AlertTitle>
                  <AlertDescription>
                    You don't have permission to mint loan tokens. Please
                    contact the administrator.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
