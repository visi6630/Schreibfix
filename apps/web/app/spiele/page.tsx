import { ProtectedPage } from "@/components/ProtectedPage";
import { SpieleClient } from "./SpieleClient";

export default function SpielePage() {
  return (
    <ProtectedPage>
      <SpieleClient />
    </ProtectedPage>
  );
}
