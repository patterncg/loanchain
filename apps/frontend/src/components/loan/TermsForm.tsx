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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function TermsForm() {
  const form = useFormContext<LoanForm>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Terms and Conditions</h2>
        <p className="text-muted-foreground">
          Define the specific terms of the loan agreement.
        </p>
      </div>

      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="terms.paymentFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Frequency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How often payments will be made.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms.earlyRepaymentPenalty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Early Repayment Penalty (%) (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="pr-8"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </FormControl>
              <FormDescription>
                Fee applied if the loan is repaid before the term ends.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms.lateFeePercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Late Payment Fee (%) (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="pr-8"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </FormControl>
              <FormDescription>
                Fee applied for late payments, as a percentage of the payment amount.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms.collateralRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collateral Requirements (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detail any specific requirements for collateral"
                  className="min-h-[80px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Specify any requirements for collateral to secure the loan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms.agreementToTerms"
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
                  I agree to the Terms and Conditions
                </FormLabel>
                <FormDescription>
                  By checking this box, you confirm that you have read and agree to the loan terms and conditions.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 