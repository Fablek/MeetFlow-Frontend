import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>MeetFlow - Frontend Ready! ✨</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </main>
  );
}