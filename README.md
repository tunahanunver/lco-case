# LCO Case

Vite + React ile geliştirilmiş, Playwright E2E testi entegre bir landing page projesi.

## Gereksinimler

- Node.js LTS (önerilen: 20.x veya güncel LTS)
- npm

## Kurulum

```bash
npm install
```

CI ortamlarında bağımlılık kurmak için:

```bash
npm ci
```

## Uygulamayı Çalıştırma

Geliştirme ortamı:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Build çıktısını lokalde önizleme:

```bash
npm run preview
```

## Playwright ile Test

İlk kurulumda Playwright browser ve sistem bağımlılıklarını yükleyin:

```bash
npx playwright install --with-deps
```

Testi başlatma

```bash
npx playwright test --headed
```

Raporu görme

```bash
npx playwright show-report
```
