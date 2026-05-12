import { ProtectedPage } from "@/components/ProtectedPage";
import { TicTacToeClient } from "./TicTacToeClient";

export default function TicTacToePage() {
  return (
    <ProtectedPage>
      <TicTacToeClient />
    </ProtectedPage>
  );
}
