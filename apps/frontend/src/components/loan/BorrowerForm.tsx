import { useFormContext } from "react-hook-form";
import { LoanForm } from "@/schemas/loan";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function BorrowerForm() {
  const form = useFormContext<LoanForm>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Borrower Information</h2>
        <p className="text-muted-foreground">
          Optional: Provide additional information about the borrower to help with loan assessment.
        </p>
      </div>

      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="borrower.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter borrower's name"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Full name of the borrower.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="borrower.contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Email address for communication about the loan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="borrower.creditScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Score (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter score between 300-850"
                  type="number"
                  min={300}
                  max={850}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Number(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                A higher credit score may result in better loan terms.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="borrower.incomeVerification"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Income Verification Available
                </FormLabel>
                <FormDescription>
                  Check this if you can provide income verification documents if requested.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="borrower.additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about the borrower"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Any other relevant information about the borrower's financial situation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 