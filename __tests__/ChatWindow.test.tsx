import { render, screen } from "@testing-library/react";
import { ChatWindow } from "@/components/ChatWindow";
import type { ChatMessage } from "@/types/chat";

const baseMessage = (overrides: Partial<ChatMessage>): ChatMessage => ({
  id: "msg-1",
  role: "assistant",
  content: "Conteúdo base",
  timestamp: "08:00",
  context: undefined,
  ...overrides,
});

describe("ChatWindow", () => {
  it("renderiza snippet biométrico quando tipo é dados_biometricos", () => {
    const messages: ChatMessage[] = [
      baseMessage({
        id: "bio-1",
        content: "Dados atualizados.",
        context: {
          tipo: "dados_biometricos",
          dados_biometricos: {
            fc: 60,
            sono: 7.1,
            variabilidade: 75,
            energia: 88,
          },
          alerta: null,
          anexo: null,
        },
      }),
    ];

    render(<ChatWindow messages={messages} isLoading={false} />);

    expect(screen.getByText("Frequência cardíaca")).toBeInTheDocument();
    expect(screen.getByText(/7\.1/)).toBeInTheDocument();
  });

  it("renderiza alerta quando contexto é alerta", () => {
    const messages: ChatMessage[] = [
      baseMessage({
        id: "alert-1",
        content: "Atenção ao pico de stress.",
        context: {
          tipo: "alerta",
          dados_biometricos: null,
          anexo: null,
          alerta: {
            tipo: "risco",
            texto: "Variabilidade em queda. Recomendado reset de 2 minutos.",
          },
        },
      }),
    ];

    render(<ChatWindow messages={messages} isLoading={false} />);

    expect(
      screen.getByText("Variabilidade em queda. Recomendado reset de 2 minutos.")
    ).toBeInTheDocument();
  });

  it("renderiza cartão de anexo quando contexto é anexo", () => {
    const messages: ChatMessage[] = [
      baseMessage({
        id: "attachment-1",
        content: "Enviei o protocolo atualizado.",
        context: {
          tipo: "anexo",
          dados_biometricos: null,
          alerta: null,
          anexo: {
            tipo: "Protocolo",
            titulo: "RAWN Focus Deck",
            descricao: "Slide com os pontos-chave para a reunião das 15h.",
            url: "https://rawn.pro/protocolos/focus-deck",
            thumbnail: null,
          },
        },
      }),
    ];

    render(<ChatWindow messages={messages} isLoading={false} />);

    expect(screen.getByText("RAWN Focus Deck")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir anexo" })).toHaveAttribute(
      "href",
      "https://rawn.pro/protocolos/focus-deck"
    );
  });

  it("exibe indicador de carregamento quando isLoading é true", () => {
    render(<ChatWindow messages={[]} isLoading />);

    expect(screen.getByText("RAWN está analisando...")).toBeInTheDocument();
  });
});
