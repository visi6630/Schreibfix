import { ProtectedPage } from "@/components/ProtectedPage";
import { ProfilClient } from "./ProfilClient";

export const metadata = { title: "Mein Profil | Schreibfix" };

export default function ProfilPage() {
  return (
    <ProtectedPage>
      <ProfilClient />
    </ProtectedPage>
  );
}
