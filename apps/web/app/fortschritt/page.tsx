import { ProtectedPage } from "@/components/ProtectedPage";
import { FortschrittClient } from "./FortschrittClient";

export default function FortschrittPage() {
  return (
    <ProtectedPage>
      <FortschrittClient />
    </ProtectedPage>
  );
}
