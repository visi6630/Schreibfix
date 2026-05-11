import { LessonPickerClient } from "./LessonPickerClient";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function DiktatPage() {
  return (
    <ProtectedPage>
      <LessonPickerClient />
    </ProtectedPage>
  );
}
