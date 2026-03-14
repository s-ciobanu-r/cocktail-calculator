"use client";

import { jsPDF } from "jspdf";
import { useMemo, useState } from "react";
import { cocktailNames } from "@/lib/cocktails";

type TotalsMap = Record<string, number>;
type GroupedMap = Record<string, TotalsMap>;

type ApiResponse = {
  totals: TotalsMap;
  grouped: GroupedMap;
};

const currencyFreeNumber = (value: number) => `${value.toFixed(1)} ml`;

export default function HomePage() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(cocktailNames.map((name) => [name, ""])),
  );
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResults = !!result && Object.keys(result.totals).length > 0;

  const sortedTotals = useMemo(
    () => Object.entries(result?.totals ?? {}).sort((a, b) => a[0].localeCompare(b[0])),
    [result],
  );

  const sortedGrouped = useMemo(() => {
    return Object.entries(result?.grouped ?? {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, ingredients]) => [
        category,
        Object.entries(ingredients).sort((a, b) => a[0].localeCompare(b[0])),
      ] as const);
  }, [result]);

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cocktailbatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate cocktail totals.");
      }

      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!result) return;

    const lines = ["Ingredient,Amount (ml)"];
    for (const [ingredient, amount] of sortedTotals) {
      lines.push(`"${ingredient.replaceAll('"', '""')}",${amount.toFixed(1)}`);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cocktail_totals.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Cocktail Ingredient Totals", 14, y);
    y += 12;

    doc.setFontSize(11);
    for (const [ingredient, amount] of sortedTotals) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${ingredient}: ${amount.toFixed(1)} ml`, 14, y);
      y += 8;
    }

    doc.save("cocktail_totals.pdf");
  };

  return (
    <main style={{ minHeight: "100vh", padding: "32px 16px" }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <section
          style={{
            background: "#2c3e50",
            color: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>🍸 Cocktail Batch Calculator</h1>
          <p style={{ margin: "10px 0 0", opacity: 0.9 }}>
            Enter the batch size for each cocktail and get ingredient totals instantly.
          </p>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {cocktailNames.map((name) => (
                <label
                  key={name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 14,
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={values[name]}
                    onChange={(event) => handleChange(name, event.target.value)}
                    placeholder="Amount in ml"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                    }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: "#3498db",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isLoading ? "Calculating..." : "Submit Batches"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(Object.fromEntries(cocktailNames.map((name) => [name, ""])));
                  setResult(null);
                  setError(null);
                }}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {error ? (
          <section
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#9f1239",
              borderRadius: 16,
              padding: 18,
            }}
          >
            {error}
          </section>
        ) : null}

        {result ? (
          <section
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ marginTop: 0 }}>Results</h2>
                <p style={{ marginTop: 0, color: "#475569" }}>
                  Totals are scaled from the original 750 ml recipe base.
                </p>
              </div>
              {hasResults ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#0f766e",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={downloadPdf}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#7c3aed",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              ) : null}
            </div>

            {hasResults ? (
              <>
                <h3>All Ingredients</h3>
                <DataTable rows={sortedTotals} />

                <h3 style={{ marginTop: 28 }}>Ingredients by Category</h3>
                <div style={{ display: "grid", gap: 18 }}>
                  {sortedGrouped.map(([category, ingredients]) => (
                    <div key={category}>
                      <h4 style={{ marginBottom: 10 }}>{category}</h4>
                      <DataTable rows={ingredients} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "#64748b", marginBottom: 0 }}>
                No totals yet. Enter one or more batch amounts above.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function DataTable({ rows }: { rows: Array<readonly [string, number]> }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={cellStyle}>Ingredient</th>
            <th style={cellStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([ingredient, amount]) => (
            <tr key={ingredient}>
              <td style={cellStyle}>{ingredient}</td>
              <td style={cellStyle}>{currencyFreeNumber(amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #e5e7eb",
};
