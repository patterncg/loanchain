import { useState } from "react";
import { useForm, FormProvider, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanForm, loanFormSchema, AiEnhancedLoan } from "@/schemas/loan";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { loanApi } from "@/lib/api";

import { LoanDetailsForm } from "./LoanDetailsForm";
import { BorrowerForm } from "./BorrowerForm";
import { TermsForm } from "./TermsForm";
import { LoanPreview } from "./LoanPreview";
import { JsonImport } from "./JsonImport";

// Default values for the form
const defaultValues: LoanForm = {
  loanDetails: {
    amount: 0,
    interestRate: 0,
    term: 0,
    termUnit: "months",
    purpose: "",
    collateral: "",
  },
  terms: {
    paymentFrequency: "monthly",
    earlyRepaymentPenalty: 0,
    lateFeePercentage: 0,
    collateralRequirements: "",
    agreementToTerms: false,
  },
};

// Steps in the wizard
const steps = [
  { id: "loan-details", label: "Loan Details" },
  { id: "borrower", label: "Borrower Info" },
  { id: "terms", label: "Terms" },
  { id: "preview", label: "Preview" },
];

export function LoanCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [aiEnhancedData, setAiEnhancedData] = useState<AiEnhancedLoan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoanForm>({
    resolver: zodResolver(loanFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const { handleSubmit, reset, trigger, getValues, formState } = form;
  const { isValid, errors } = formState;
  
  // Progress calculation
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Handle next step navigation
  const handleNextStep = async () => {
    // Validate the current step's fields before proceeding
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate as FieldPath<LoanForm>[]);
    
    if (isStepValid) {
      if (currentStep < steps.length - 2) {
        // Move to the next step if we're not at the preview step yet
        setCurrentStep(currentStep + 1);
      } else if (currentStep === steps.length - 2) {
        // When moving to preview step, analyze the loan with AI
        await handleAnalyzeLoan();
      }
    }
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Analyze loan data with AI
  const handleAnalyzeLoan = async () => {
    try {
      setIsAnalyzing(true);
      const loanData = getValues();
      
      // Call the API to enhance the loan data
      const enhancedData = await loanApi.enhanceLoan(loanData);
      
      // Store the enhanced data
      setAiEnhancedData(enhancedData);
      
      // Move to the preview step
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error("Error analyzing loan:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle form submission (mint loan token)
  const onSubmit = (data: LoanForm) => {
    // Here we would integrate with the blockchain to create the loan token
    console.log("Form submitted with data:", data);
    console.log("AI-enhanced data:", aiEnhancedData);
    
    // In a complete implementation, we would:
    // 1. Call a smart contract function to mint the loan token
    // 2. Store the metadata (including AI analysis) on IPFS
    // 3. Show a success message and redirect to loan management page
    
    alert("Loan creation form submitted successfully! (Integration with blockchain pending)");
  };
  
  // Import JSON data
  const handleJsonImport = (data: LoanForm) => {
    reset(data);
    setShowJsonImport(false);
  };
  
  // Get the fields that should be validated for a specific step
  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0:
        return Object.keys(loanFormSchema.shape.loanDetails.shape).map(
          (field) => `loanDetails.${field}`
        );
      case 1:
        return []; // Borrower info is optional
      case 2:
        return Object.keys(loanFormSchema.shape.terms.shape).map(
          (field) => `terms.${field}`
        );
      default:
        return [];
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (showJsonImport) {
      return (
        <JsonImport 
          onImport={handleJsonImport} 
          onCancel={() => setShowJsonImport(false)} 
        />
      );
    }
    
    switch (currentStep) {
      case 0:
        return <LoanDetailsForm />;
      case 1:
        return <BorrowerForm />;
      case 2:
        return <TermsForm />;
      case 3:
        return <LoanPreview enhancedData={aiEnhancedData!} isLoading={isAnalyzing} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Create New Loan</h1>
        <p className="text-muted-foreground">
          Create a new loan by filling out the form below. The AI will analyze your loan and provide recommendations.
        </p>
        
        {/* JSON Import Button */}
        {!showJsonImport && currentStep < 3 && (
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowJsonImport(true)}
            className="mt-2"
          >
            Import JSON
          </Button>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Step tabs */}
      <Tabs 
        defaultValue={steps[currentStep].id} 
        value={steps[currentStep].id}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-4 w-full">
          {steps.map((step, index) => (
            <TabsTrigger 
              key={step.id} 
              value={step.id}
              disabled={index !== currentStep}
              className="data-[state=active]:border-b-2"
            >
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Form */}
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
            <TabsContent value={steps[currentStep].id}>
              {renderStepContent()}
            </TabsContent>
            
            {/* Error summary if needed */}
            {Object.keys(errors).length > 0 && currentStep < 3 && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>
                      {error?.message?.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === 2 && !isValid}
                >
                  {currentStep === steps.length - 2 ? "Preview" : "Next"}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!aiEnhancedData || isAnalyzing}
                >
                  Create Loan
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </Tabs>
    </div>
  );
} 