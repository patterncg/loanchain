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

export function LoanDetailsForm() {
  const form = useFormContext<LoanForm>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Loan Details</h2>
        <p className="text-muted-foreground">
          Enter the basic details of your loan request.
        </p>
      </div>

      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="loanDetails.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    type="number"
                    step="0.01"
                  />
                </div>
              </FormControl>
              <FormDescription>Enter the amount you wish to borrow.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanDetails.interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interest Rate (%)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="0.00"
                    {...field}
                    type="number"
                    step="0.01"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </FormControl>
              <FormDescription>Annual percentage rate.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="loanDetails.term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loanDetails.termUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="loanDetails.purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Purpose</FormLabel>
              <FormControl>
                <Input
                  placeholder="Describe the purpose of this loan"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly describe what the loan will be used for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanDetails.collateral"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collateral (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe any collateral for this loan"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any assets that will be used as collateral.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 