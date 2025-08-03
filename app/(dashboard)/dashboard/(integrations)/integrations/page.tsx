import { enforcePermission } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IntegrationsPage() {
  await enforcePermission('tenant:manage'); 

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect Scholian with your favorite tools.</p>
        <Card>
            <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>This is a placeholder for integration management.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">A marketplace or list of available integrations would be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}