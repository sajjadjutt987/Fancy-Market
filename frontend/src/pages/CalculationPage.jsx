import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CalculationPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    sourceSide: "Back",
    margin: "5",
    title: "",
    runs: "",
    initialMean: "",
    initialStdDev: "",
    rateDiff: "0.10"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError("");
        const response = await api.get(`/markets/fancies/${eventId}`);
        const fetchedRows = Array.isArray(response.data.data) ? response.data.data : [];
        setRows(fetchedRows);

        if (fetchedRows.length > 0) {
          setSelected(fetchedRows[0]);
        }
      } catch (error) {
        setFetchError("Unable to fetch fancy list");
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      title: selected.runnerName || prev.title || "",
      initialMean:
        prev.initialMean && prev.initialMean !== ""
          ? prev.initialMean
          : selected.sourceBack != null
          ? String(selected.sourceBack)
          : ""
    }));

    setResult(null);
    setSubmitError("");
  }, [selected]);

  const calculatedPreview = useMemo(() => {
    const initialMean = Number(form.initialMean);
    const initialStdDev = Number(form.initialStdDev);

    const sourceBack =
      selected?.sourceBack != null ? Number(selected.sourceBack) : NaN;
    const sourceLay =
      selected?.sourceLay != null ? Number(selected.sourceLay) : NaN;

    const currentMean =
      form.sourceSide === "Lay"
        ? (Number.isFinite(sourceLay) ? sourceLay : initialMean)
        : (Number.isFinite(sourceBack) ? sourceBack : initialMean);

    if (
      !Number.isFinite(initialMean) ||
      initialMean <= 0 ||
      !Number.isFinite(initialStdDev) ||
      initialStdDev <= 0 ||
      !Number.isFinite(currentMean)
    ) {
      return {
        currentMean: "",
        currentStdDev: ""
      };
    }

    const currentStdDev = initialStdDev * (currentMean / initialMean);

    return {
      currentMean: Number(currentMean.toFixed(2)),
      currentStdDev: Number(currentStdDev.toFixed(2))
    };
  }, [
    form.sourceSide,
    form.initialMean,
    form.initialStdDev,
    selected?.sourceBack,
    selected?.sourceLay
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUseRow = (row) => {
    setSelected(row);
  };

  const handleCalculate = async () => {
    console.log("CALCULATE CLICKED");
    try {
      setSubmitError("");

      if (!selected) {
        setSubmitError("Please select a fancy row first");
        return;
      }

      const response = await api.post("/markets/calculate", {
        eventId,
        marketId: selected.marketId,
        marketTitle: form.title,
        title: form.title,
        source: form.sourceSide,
        sourceSide: form.sourceSide,
        margin: Number(form.margin) / 100,
        runsLine: Number(form.runs),
        runs: Number(form.runs),
        initialMean: Number(form.initialMean),
        initialStdDev: Number(form.initialStdDev),
        rateDiff: Number(form.rateDiff),
        sourceData: selected
      });

      setResult(response.data.data);
    } catch (error) {
      setSubmitError("Calculation failed");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <button type="button" onClick={() => navigate("/")} style={backButtonStyle}>
          ← Back
        </button>
        <div style={titleStyle}>Fancy Calculation</div>
      </div>

      {fetchError ? <div style={errorStyle}>{fetchError}</div> : null}
      {submitError ? <div style={errorStyle}>{submitError}</div> : null}

      <div style={layoutStyle}>
        <div style={leftCardStyle}>
          <div style={sectionTitleStyle}>Fancy List</div>

          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Runner</th>
                  <th style={thStyle}>Back</th>
                  <th style={thStyle}>Lay</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isSelected = selected?.marketId === row.marketId;

                  return (
                    <tr key={row.id || row.marketId}>
                      <td style={tdStyle}>{row.runnerName}</td>
                      <td style={tdStyle}>{row.sourceBack ?? "N/A"}</td>
                      <td style={tdStyle}>{row.sourceLay ?? "N/A"}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => handleUseRow(row)}
                          style={isSelected ? selectedButtonStyle : useButtonStyle}
                        >
                          {isSelected ? "Selected" : "Use"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={sectionTitleStyle}>Source Section</div>

          {selected ? (
            <div style={sourceBoxStyle}>
              <div style={sourceNameStyle}>{selected.runnerName || "N/A"}</div>
              <div style={sourceRatesStyle}>
                <div>Back: {selected.sourceBack ?? "N/A"}</div>
                <div>Lay: {selected.sourceLay ?? "N/A"}</div>
              </div>
            </div>
          ) : (
            <div style={emptyStyle}>No source selected</div>
          )}

          <div style={sectionTitleStyle}>Calculation Fields</div>

          <FieldRow
            label="Source Side"
            field={
              <select
                name="sourceSide"
                value={form.sourceSide}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Back">Back</option>
                <option value="Lay">Lay</option>
              </select>
            }
          />

          <FieldRow
            label="Margin"
            field={
              <input
                name="margin"
                value={form.margin}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Title"
            field={
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Runs"
            field={
              <input
                name="runs"
                value={form.runs}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Initial Mean"
            field={
              <input
                name="initialMean"
                value={form.initialMean}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Initial Std Dev"
            field={
              <input
                name="initialStdDev"
                value={form.initialStdDev}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Rate Diff"
            field={
              <input
                name="rateDiff"
                value={form.rateDiff}
                onChange={handleChange}
                style={inputStyle}
              />
            }
          />

          <FieldRow
            label="Current Mean"
            field={<StaticValue value={calculatedPreview.currentMean || "N/A"} />}
          />

          <FieldRow
            label="Current Std Dev"
            field={<StaticValue value={calculatedPreview.currentStdDev || "N/A"} />}
          />

          <button
            type="button"
            onClick={handleCalculate}
            disabled={!selected}
            style={{
              ...calcButtonStyle,
              opacity: !selected ? 0.6 : 1
            }}
          >
            Calculate
          </button>
        </div>

        <div style={rightCardStyle}>
          <div style={sectionTitleStyle}>Final Display</div>

          {result ? (
            <div style={resultBoxStyle}>
              <div style={resultTitleStyle}>{result.displayTitle}</div>

              <table style={resultTableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}></th>
                    <th style={thStyle}>Back</th>
                    <th style={thStyle}>Lay</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={labelTdStyle}>Yes</td>
                    <td style={backTdStyle}>{result.backYes}</td>
                    <td style={layTdStyle}>{result.layYes}</td>
                  </tr>
                  <tr>
                    <td style={labelTdStyle}>No</td>
                    <td style={backTdStyle}>{result.backNo}</td>
                    <td style={layTdStyle}>{result.layNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>Calculate to view final display</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, field }) {
  return (
    <div style={rowStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={fieldStyle}>{field}</div>
    </div>
  );
}

function StaticValue({ value }) {
  return <div style={staticStyle}>{value}</div>;
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: "24px"
};

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px"
};

const backButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: "8px",
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: "700"
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#111827"
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 360px",
  gap: "24px",
  maxWidth: "1200px"
};

const leftCardStyle = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "18px"
};

const rightCardStyle = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "18px",
  alignSelf: "start"
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "800",
  marginBottom: "14px",
  color: "#111827"
};

const sourceBoxStyle = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "14px",
  marginBottom: "14px"
};

const sourceNameStyle = {
  fontWeight: "700",
  fontSize: "18px",
  marginBottom: "8px",
  color: "#111827"
};

const sourceRatesStyle = {
  display: "flex",
  gap: "20px",
  fontWeight: "600",
  color: "#374151"
};

const tableWrapStyle = {
  overflowX: "auto",
  marginBottom: "16px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  padding: "12px",
  textAlign: "center",
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb"
};

const useButtonStyle = {
  border: "none",
  background: "#111827",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "8px 12px",
  fontWeight: "700",
  cursor: "pointer"
};

const selectedButtonStyle = {
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "8px 12px",
  fontWeight: "700"
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "160px 1fr",
  gap: "12px",
  alignItems: "start",
  marginBottom: "12px"
};

const labelStyle = {
  paddingTop: "10px",
  fontWeight: "700",
  color: "#111827"
};

const fieldStyle = {};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #9ca3af",
  borderRadius: "8px",
  background: "#dcead4",
  fontSize: "16px"
};

const staticStyle = {
  padding: "10px 12px",
  border: "1px dashed #8b5cf6",
  borderRadius: "8px",
  background: "#ffffff",
  fontSize: "16px",
  color: "#111827"
};

const calcButtonStyle = {
  marginTop: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "12px 16px",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer"
};

const errorStyle = {
  color: "#b91c1c",
  marginBottom: "12px"
};

const resultBoxStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  overflow: "hidden"
};

const resultTitleStyle = {
  padding: "14px",
  background: "#f9fafb",
  fontWeight: "800",
  fontSize: "18px",
  textAlign: "center"
};

const resultTableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const labelTdStyle = {
  padding: "14px",
  fontWeight: "800",
  borderBottom: "1px solid #e5e7eb"
};

const backTdStyle = {
  padding: "14px",
  textAlign: "center",
  background: "#cfe2ff",
  fontWeight: "800",
  fontSize: "22px",
  borderBottom: "1px solid #e5e7eb"
};

const layTdStyle = {
  padding: "14px",
  textAlign: "center",
  background: "#ffd1dc",
  fontWeight: "800",
  fontSize: "22px",
  borderBottom: "1px solid #e5e7eb"
};

const emptyStyle = {
  color: "#6b7280"
};

export default CalculationPage;