import { enforcePermission } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage() {
  await enforcePermission('tenant:view_billing'); 

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">Manage your plan, payment methods, and view invoices.</p>
        <Card>
            <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>This is a placeholder for billing information.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Integration with a payment provider like Stripe would be implemented here.</p>
            </CardContent>
        </Card>
    </div>
  );
}