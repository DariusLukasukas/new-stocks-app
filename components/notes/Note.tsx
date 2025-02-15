import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Note() {
  return (
    <Card className="z-20 h-full min-h-96">
      <CardHeader className="pb-4 select-none">
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          contentEditable
          data-placeholder="What's on your mind?"
          className="caret-blue-500 outline-none"
        />
      </CardContent>
    </Card>
  );
}
