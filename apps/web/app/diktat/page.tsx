import { sampleDiktatLesson } from "@schreibfix/core";
import { DiktatClient } from "./DiktatClient";

export default function DiktatPage() {
  return <DiktatClient lesson={sampleDiktatLesson} />;
}
