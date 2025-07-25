"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DeleteAccountSchema, DeleteAccountInput } from "@/lib/dto/settings";
import { deleteAccountAction } from "@/lib/actions/settings";

export function DeleteAccountForm() {
  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(DeleteAccountSchema),
    defaultValues: {
      confirm: "",
    },
  });

  const onSubmit = async () => {
    // A native confirm dialog is a good extra layer of protection here.
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
        const result = await deleteAccountAction();
        if (result.success) {
            toast.success(result.message);
            // The server action will handle the redirect.
        } else {
            toast.error(result.message);
        }
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Deleting your account is a permanent action and cannot be reversed.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To confirm, type &quot;delete my account&quot; below</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t border-destructive/50 px-6 py-4">
            <Button variant="destructive" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Deleting..." : "Delete My Account"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}