// app/page.js
import Chat from "./components/Chat";

export default function Page() {
  // Deixa toda a lógica no componente Chat (cliente),
  // evitando conflito com o antigo streaming do page.js.
  return <Chat />;
}
