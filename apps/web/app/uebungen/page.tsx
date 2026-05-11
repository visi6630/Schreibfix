import { ProtectedPage } from "@/components/ProtectedPage";
import { UebungenClient } from "./UebungenClient";

export default function UebungenPage() {
  return (
    <ProtectedPage>
      <UebungenClient />
    </ProtectedPage>
  );
}
