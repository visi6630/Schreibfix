import { ProtectedPage } from "@/components/ProtectedPage";
import { HangmannClient } from "./HangmannClient";

export default function HangmannPage() {
  return (
    <ProtectedPage>
      <HangmannClient />
    </ProtectedPage>
  );
}
