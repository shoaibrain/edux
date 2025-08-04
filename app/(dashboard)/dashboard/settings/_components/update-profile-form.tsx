'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UpdateProfileSchema, UpdateProfileInput } from "@/lib/dto/settings";
import { updateProfileAction } from "@/lib/actions/settings";
import { UserSession } from "@/lib/session";

interface UpdateProfileFormProps {
  user: UserSession;
}

export default function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const onSubmit = async (values: UpdateProfileInput) => {
    const result = await updateProfileAction(values);
    if (result.success) {
      toast.success(result.message);
      // Re-fetch session or update context if needed after successful profile update
    } else {
      toast.error(result.message);
      if (!result.success) {
        form.setError("email", { type: "server", message: result.message });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>Update your account profile information.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
