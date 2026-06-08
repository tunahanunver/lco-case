import { expect, test, type Page } from "@playwright/test";

type Opt = "A" | "B";

const scenarios: Array<{ name: string; steps: [Opt, Opt, Opt] }> = [
  { name: "AAA", steps: ["A", "A", "A"] },
  { name: "AAB", steps: ["A", "A", "B"] },
  { name: "ABA", steps: ["A", "B", "A"] },
  { name: "ABB", steps: ["A", "B", "B"] },
  { name: "BAA", steps: ["B", "A", "A"] },
  { name: "BAB", steps: ["B", "A", "B"] },
  { name: "BBA", steps: ["B", "B", "A"] },
  { name: "BBB", steps: ["B", "B", "B"] },
];

async function chooseAndConfirm(page: Page, option: Opt) {
  await page.getByTestId(option === "A" ? "option-a" : "option-b").click();
  await page.getByTestId("next-step-btn").click();
}

test.describe("Landing to Matchday dashboard flow", () => {
  test.describe.configure({ mode: "serial" });

  for (const scenario of scenarios) {
    test(`completes full flow for scenario ${scenario.name}`, async ({ page }) => {
      await page.goto("/");

      const quiz = page.getByTestId("quiz-container");
      await expect(quiz).toBeVisible();
      await expect(page.getByText(/WHAT KIND OF OWNER ARE YOU\?/i)).toBeVisible();

      // Step 1
      await expect(page.getByText("THE STAR PLAYER DILEMMA")).toBeVisible();
      await chooseAndConfirm(page, scenario.steps[0]);

      // Step 2 branch
      if (scenario.steps[0] === "A") {
        await expect(page.getByText("REINVESTING THE CASH")).toBeVisible();
      } else {
        await expect(page.getByText("FINANCIAL DISTRESS")).toBeVisible();
      }
      await chooseAndConfirm(page, scenario.steps[1]);

      // Step 3
      await expect(page.getByText("THE CHAMPIONSHIP FINAL")).toBeVisible();
      await chooseAndConfirm(page, scenario.steps[2]);

      // Loading overlay then final dashboard
      await expect(page.getByText("ANALYZING YOUR OWNER PROFILE...")).toBeVisible();
      await expect(page.getByText("ANALYZING YOUR OWNER PROFILE...")).toBeHidden({ timeout: 10000 });

      await expect(page.getByText("MATCHDAY: THE GRAND FINAL")).toBeVisible();
      await expect(page.getByText("Owner DNA")).toBeVisible();
      const final = page.getByTestId("final-container");
      await expect(final).toBeVisible();
      await expect(final.locator("div.h-3.overflow-hidden.rounded-full.bg-zinc-800").first()).toBeVisible();

      const downloadButton = page.getByTestId("download-beta-btn");
      await expect(downloadButton).toBeVisible();
      await expect(downloadButton).toHaveAttribute(
        "href",
        "https://apps.apple.com/tr/app/efsane-ba%C5%9Fkan/id6743401408",
      );
      await expect(downloadButton).toBeEnabled();
    });
  }
});
