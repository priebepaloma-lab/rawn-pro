import { test, expect } from "@playwright/test";

test("usuário envia mensagem e recebe resposta do RAWN PRO", async ({ page }) => {
  await page.goto("/");

  const messages = page.locator('[data-testid="chat-message"]');
  await messages.first().waitFor({ timeout: 15000 });
  const initialCount = await messages.count();

  const input = page.getByLabel("Mensagem para o RAWN PRO");
  await input.fill("Preciso de alerta de risco para minha agenda de hoje.");
  await input.press("Enter");

  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll('[data-testid="chat-message"]').length >=
      expected,
    initialCount + 1
  );

  const loader = page.getByText("RAWN está analisando...");
  try {
    await loader.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    // Loader pode aparecer rapidamente; seguimos mesmo sem visibilidade explícita.
  }
  await loader.waitFor({ state: "detached" });

  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll('[data-testid="chat-message"]').length >=
      expected,
    initialCount + 2,
    { timeout: 90_000 }
  );

  const latestMessage = messages.nth((await messages.count()) - 1);
  const latestText = (await latestMessage.innerText()).trim();
  expect(latestText.length).toBeGreaterThan(0);
});
