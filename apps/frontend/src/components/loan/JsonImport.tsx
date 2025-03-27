import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoanForm, loanFormSchema } from "@/schemas/loan";
import { z } from "zod";

interface JsonImportProps {
  onImport: (data: LoanForm) => void;
  onCancel: () => void;
}

export function JsonImport({ onImport, onCancel }: JsonImportProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      // First, parse the JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonInput);
        setError(null);
      } catch {
        setError("Invalid JSON format. Please check your input.");
        return;
      }

      // Then validate against our schema
      try {
        const validated = loanFormSchema.parse(parsed);
        onImport(validated);
      } catch (e) {
        if (e instanceof z.ZodError) {
          // Format Zod error messages
          const errorMessages = e.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`,
          );
          setError(`Validation errors:\n${errorMessages.join("\n")}`);
        } else {
          setError("Invalid loan data format. Please check your input.");
        }
      }
    } catch (error) {
      setError("An error occurred while importing the data.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Import Loan Data</h2>
        <p className="text-muted-foreground">
          Paste your JSON loan data below to import it into the form.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{
  "loanDetails": {
    "amount": 10000,
    "interestRate": 5.5,
    "term": 12,
    "termUnit": "months",
    "purpose": "Home renovation",
    "collateral": "Property deed"
  },
  "borrower": {
    "name": "John Doe",
    "contactInfo": "john.doe@example.com",
    "creditScore": 750
  },
  "terms": {
    "paymentFrequency": "monthly",
    "earlyRepaymentPenalty": 1.5,
    "agreementToTerms": true
  }
}`}
          className="min-h-[250px] font-mono text-sm"
        />

        {error && (
          <div className="text-red-500 text-sm whitespace-pre-wrap p-4 bg-red-50 dark:bg-red-950 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import Data</Button>
        </div>
      </div>
    </div>
  );
}
