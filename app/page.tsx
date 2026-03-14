"use client";

import { useMemo, useState } from "react";

type Totals = Record<string, number>;
type Grouped = Record<string, Record<string, number>>;

const cocktails = [
  "Negroni",
  "Boulevardier",
  "Melon Blossom",
  "Pornstar Martini",
  "Espresso Martini",
  "Cosmopolitan",
  "Venus Spritz",
  "Old Fashioned",
  "Whiskey Sour",
  "Botanica",
  "Aperol Oro Spritz",
  "Turqoise",
  "Que Bola",
];

const featuredCopy: Record<string, string> = {
  Negroni: "Bitter, polished, timeless.",
  Boulevardier: "Silky, warm, late-night energy.",
  "Melon Blossom": "Bright, playful, floral.",
  "Pornstar Martini": "Loud, glossy, celebratory.",
  "Espresso Martini": "Dark roast, velvet finish.",
  Cosmopolitan: "Crisp, sharp, iconic.",
  "Venus Spritz": "Soft fruit with botanical lift.",
  "Old Fashioned": "Classic amber authority.",
  "Whiskey Sour": "Balanced, bright, structured.",
  Botanica: "Zero-proof, garden-club elegance.",
  "Aperol Oro Spritz": "Golden hour in a glass.",
  Turqoise: "Tropical neon, clean finish.",
  "Que Bola": "Juicy, rich, party-ready.",
};

function formatMl(value: number) {
  return `${value.toFixed(1)} ml`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function HomePage() {
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(cocktails.map((name) => [name, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ totals: Totals; grouped: Grouped } | null>(null);

  const enteredCocktails = useMemo(
    () =>
      Object.entries(amounts)
        .filter(([, value]) => Number(value) > 0)
        .map(([name, value]) => ({ name, amount: Number(value) })),
    [amounts]
  );

  const totalBatchMl = enteredCocktails.reduce((sum, item) => sum + item.amount, 0);
  const activeCount = enteredCocktails.length;

  const sortedTotals = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.totals).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const groupedEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [result]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = Object.fromEntries(
      Object.entries(amounts).filter(([, value]) => Number(value) > 0)
    );

    try {
      const response = await fetch("/api/cocktailbatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setAmounts(Object.fromEntries(cocktails.map((name) => [name, ""])));
    setResult(null);
    setError("");
  }

  function downloadCsv() {
    if (!result) return;

    const rows = [["Ingredient", "Amount (ml)"]].concat(
      Object.entries(result.totals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([ingredient, amount]) => [ingredient, amount.toFixed(1)])
    );

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cocktail-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    window.print();
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="hero">
        <div className="hero-badge">Vintage Inventory Console · Modern Batch Planner</div>

        <div className="hero-grid">
          <div>
            <p className="eyebrow">Inventory & Batching</p>
            <h1>Vintage soul. Modern control.</h1>
            <p className="hero-copy">
              A premium batching and inventory dashboard for service nights, prep runs,
              and event planning. Enter the target ml per cocktail and generate a clean
              ingredient breakdown instantly.
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-label">Recipes loaded</span>
                <strong>{cocktails.length}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active selections</span>
                <strong>{activeCount}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Planned volume</span>
                <strong>{totalBatchMl.toFixed(0)} ml</strong>
              </div>
            </div>
          </div>

          <aside className="hero-panel">
            <div className="hero-panel-inner">
              <p className="panel-kicker">House note</p>
              <h2>Built like a luxury bar ledger.</h2>
              <p>
                Deep ink tones, brass accents, soft paper warmth, and sharp modern spacing.
                It feels like a classic hotel cocktail book redesigned for operations.
              </p>
              <div className="panel-rule" />
              <p className="panel-small">
                Enter only the drinks you’re batching or stocking today. Blank fields are ignored.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="form-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Planner</p>
            <h2>Build your prep sheet</h2>
          </div>
          <div className="heading-actions">
            <button type="button" className="ghost-button" onClick={resetAll}>
              Reset
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cocktail-grid">
            {cocktails.map((name, index) => (
              <label key={name} className="cocktail-card">
                <div className="cocktail-card-top">
                  <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="card-chip">{slugify(name)}</span>
                </div>

                <div className="cocktail-title-row">
                  <h3>{name}</h3>
                  <span className="unit-pill">ml</span>
                </div>

                <p className="cocktail-copy">{featuredCopy[name]}</p>

                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  value={amounts[name]}
                  onChange={(e) =>
                    setAmounts((current) => ({
                      ...current,
                      [name]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="submit-row">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Calculating..." : "Generate inventory totals"}
            </button>
            <p className="submit-note">
              Fast enough for service prep. Clean enough for production planning.
            </p>
          </div>

          {error ? <div className="error-box">{error}</div> : null}
        </form>
      </section>

      {result ? (
        <section className="results-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Output</p>
              <h2>Inventory totals</h2>
            </div>
            <div className="heading-actions">
              <button type="button" className="ghost-button" onClick={downloadCsv}>
                Download CSV
              </button>
              <button type="button" className="primary-button compact" onClick={printPdf}>
                Save / Print PDF
              </button>
            </div>
          </div>

          <div className="results-grid">
            <div className="results-card">
              <div className="results-card-header">
                <h3>All ingredients</h3>
                <span>{sortedTotals.length} items</span>
              </div>

              <div className="results-table">
                {sortedTotals.map(([ingredient, amount]) => (
                  <div className="results-row" key={ingredient}>
                    <span>{ingredient}</span>
                    <strong>{formatMl(amount)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="results-side">
              {groupedEntries.map(([category, items]) => (
                <div className="category-card" key={category}>
                  <div className="results-card-header">
                    <h3>{category}</h3>
                    <span>{Object.keys(items).length} items</span>
                  </div>

                  <div className="results-table tight">
                    {Object.entries(items)
                      .sort((a, b) => b[1] - a[1])
                      .map(([ingredient, amount]) => (
                        <div className="results-row" key={ingredient}>
                          <span>{ingredient}</span>
                          <strong>{formatMl(amount)}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
