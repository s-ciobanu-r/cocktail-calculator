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

function formatMl(value: number) {
  return `${value.toFixed(1)} ml`;
}

export default function HomePage() {
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(cocktails.map((name) => [name, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ totals: Totals; grouped: Grouped } | null>(null);
  const [ingredientQuery, setIngredientQuery] = useState("");

  const activeEntries = useMemo(
    () =>
      Object.entries(amounts)
        .filter(([, value]) => Number(value) > 0)
        .map(([name, value]) => ({
          name,
          amount: Number(value),
        })),
    [amounts]
  );

  const totalPlannedMl = activeEntries.reduce((sum, item) => sum + item.amount, 0);

  const sortedTotals = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.totals).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const filteredTotals = useMemo(() => {
    if (!ingredientQuery.trim()) return sortedTotals;
    const q = ingredientQuery.toLowerCase().trim();
    return sortedTotals.filter(([ingredient]) => ingredient.toLowerCase().includes(q));
  }, [ingredientQuery, sortedTotals]);

  const filteredGrouped = useMemo(() => {
    if (!result) return [];
    const q = ingredientQuery.toLowerCase().trim();

    return Object.entries(result.grouped)
      .map(([groupName, items]) => {
        const filteredItems = Object.entries(items)
          .filter(([ingredient]) => !q || ingredient.toLowerCase().includes(q))
          .sort((a, b) => b[1] - a[1]);

        return [groupName, filteredItems] as const;
      })
      .filter(([, items]) => items.length > 0);
  }, [ingredientQuery, result]);

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
      setIngredientQuery("");
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
    setIngredientQuery("");
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
    link.download = "inventory-totals.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    window.print();
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="kicker">Inventory / Batching</p>
          <h1>Enter amounts in ml</h1>
        </div>

        <div className="topbar-actions">
          <button type="button" className="secondary-button" onClick={resetAll}>
            Reset
          </button>
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Recipes</span>
          <strong>{cocktails.length}</strong>
        </div>
        <div className="summary-card">
          <span>Active</span>
          <strong>{activeEntries.length}</strong>
        </div>
        <div className="summary-card">
          <span>Total planned</span>
          <strong>{totalPlannedMl.toFixed(0)} ml</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Inputs</h2>
            <p>Enter target ml per cocktail.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-grid">
            {cocktails.map((name) => (
              <label key={name} className="input-card">
                <div className="input-card-label">{name}</div>
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

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Generating..." : "Generate totals"}
            </button>
          </div>

          {error ? <div className="error-box">{error}</div> : null}
        </form>
      </section>

      {result ? (
        <section className="panel results-panel">
          <div className="panel-header panel-header-stack">
            <div>
              <h2>Results</h2>
              <p>{filteredTotals.length} ingredients shown</p>
            </div>

            <div className="results-actions">
              <input
                type="text"
                className="search-input"
                placeholder="Search ingredients..."
                value={ingredientQuery}
                onChange={(e) => setIngredientQuery(e.target.value)}
              />
              <button type="button" className="secondary-button" onClick={downloadCsv}>
                CSV
              </button>
              <button type="button" className="primary-button" onClick={printPdf}>
                PDF
              </button>
            </div>
          </div>

          <div className="results-grid">
            <div className="results-card">
              <div className="results-card-header">
                <h3>All ingredients</h3>
              </div>

              <div className="results-list">
                {filteredTotals.length > 0 ? (
                  filteredTotals.map(([ingredient, amount]) => (
                    <div className="results-row" key={ingredient}>
                      <span>{ingredient}</span>
                      <strong>{formatMl(amount)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No ingredients match that search.</div>
                )}
              </div>
            </div>

            <div className="results-groups">
              {filteredGrouped.map(([groupName, items]) => (
                <div className="results-card" key={groupName}>
                  <div className="results-card-header">
                    <h3>{groupName}</h3>
                  </div>

                  <div className="results-list compact">
                    {items.map(([ingredient, amount]) => (
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
