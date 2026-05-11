import { sampleDiktatLesson } from "@schreibfix/core";
import { DiktatClient } from "./DiktatClient";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function DiktatPage() {
  return (
    <ProtectedPage>
      <DiktatClient lesson={sampleDiktatLesson} />
    </ProtectedPage>
  );
}
