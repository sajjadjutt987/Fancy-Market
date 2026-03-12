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
    let intervalId;

    const fetchData = async () => {
      try {
        setFetchError("");
        const response = await api.get(`/markets/fancies/${eventId}`);
        const fetchedRows = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setRows(fetchedRows);

        if (selected) {
          const updatedSelected = fetchedRows.find(
            (r) => r.marketId === selected.marketId
          );
          if (updatedSelected) {
            setSelected(updatedSelected);
          }
        } else if (fetchedRows.length > 0) {
          setSelected(fetchedRows[0]);
        }
      } catch (error) {
        setFetchError("Unable to fetch fancy list");
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, [eventId, selected?.marketId]);

  useEffect(() => {
    if (!selected) return;

    const selectedRunnerName =
      selected.runnerName || selected.RunnerName || "";

    const selectedBackValue =
      selected.sourceBack != null
        ? selected.sourceBack
        : selected.BackPrice1 != null
        ? selected.BackPrice1
        : "";

    setForm((prev) => ({
      ...prev,
      title: selectedRunnerName || prev.title || "",
      initialMean:
        prev.initialMean && prev.initialMean !== ""
          ? prev.initialMean
          : selectedBackValue !== ""
          ? String(selectedBackValue)
          : ""
    }));

    setResult(null);
    setSubmitError("");
  }, [selected]);

  const calculatedPreview = useMemo(() => {
    const initialMean = Number(form.initialMean);
    const initialStdDev = Number(form.initialStdDev);

    const sourceBack =
      selected?.sourceBack != null
        ? Number(selected.sourceBack)
        : selected?.BackPrice1 != null
        ? Number(selected.BackPrice1)
        : NaN;

    const sourceLay =
      selected?.sourceLay != null
        ? Number(selected.sourceLay)
        : selected?.LayPrice1 != null
        ? Number(selected.LayPrice1)
        : NaN;

    const currentMean =
      form.sourceSide === "Lay"
        ? Number.isFinite(sourceLay)
          ? sourceLay
          : initialMean
        : Number.isFinite(sourceBack)
        ? sourceBack
        : initialMean;

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
    selected?.sourceLay,
    selected?.BackPrice1,
    selected?.LayPrice1
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

  const orderedRows = [
    ...(selected
      ? rows.filter((r) => r.marketId === selected.marketId)
      : []),
    ...rows.filter((r) => !selected || r.marketId !== selected.marketId)
  ];

  const selectedRunnerName =
    selected?.runnerName || selected?.RunnerName || "N/A";

  const selectedBackPrice =
    selected?.sourceBack != null
      ? selected.sourceBack
      : selected?.BackPrice1 != null
      ? selected.BackPrice1
      : "N/A";

  const selectedLayPrice =
    selected?.sourceLay != null
      ? selected.sourceLay
      : selected?.LayPrice1 != null
      ? selected.LayPrice1
      : "N/A";

  const selectedBackSize =
    selected?.BackSize1 != null ? selected.BackSize1 : "N/A";

  const selectedLaySize =
    selected?.LaySize1 != null ? selected.LaySize1 : "N/A";

  const gameStatusText = (selected?.GameStatus || "").trim();
  const normalizedGameStatus = gameStatusText.toLowerCase();

  const isSuspended =
    normalizedGameStatus.includes("suspend") ||
    normalizedGameStatus.includes("suspended");

  const isBallRunning =
    normalizedGameStatus.includes("ball") &&
    normalizedGameStatus.includes("running");

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

      <div style={pageContentStyle}>
        <div style={topSectionStyle}>
          <div style={leftCardStyle}>
            <div style={sectionTitleStyle}>Fancy List</div>

            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "42%" }}>Runner</th>
                    <th style={{ ...thStyle, width: "19%" }}>Back</th>
                    <th style={{ ...thStyle, width: "19%" }}>Lay</th>
                    <th style={{ ...thStyle, width: "20%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedRows.map((row) => {
                    const isSelected = selected?.marketId === row.marketId;
                    const rowRunnerName = row.runnerName || row.RunnerName || "N/A";
                    const rowBack =
                      row.sourceBack != null
                        ? row.sourceBack
                        : row.BackPrice1 != null
                        ? row.BackPrice1
                        : "N/A";
                    const rowLay =
                      row.sourceLay != null
                        ? row.sourceLay
                        : row.LayPrice1 != null
                        ? row.LayPrice1
                        : "N/A";
                    const rowBackSize =
                      row.BackSize1 != null ? row.BackSize1 : "N/A";
                    const rowLaySize =
                      row.LaySize1 != null ? row.LaySize1 : "N/A";

                    return (
                      <tr key={row.id || row.marketId}>
                        <td style={tdStyle}>{rowRunnerName}</td>
                        <td style={tdStyle}>
                          <div style={miniBackBoxStyle}>
                            <div style={miniPriceStyle}>{rowBack}</div>
                            <div style={miniSizeStyle}>Size: {rowBackSize}</div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={miniLayBoxStyle}>
                            <div style={miniPriceStyle}>{rowLay}</div>
                            <div style={miniSizeStyle}>Size: {rowLaySize}</div>
                          </div>
                        </td>
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
          </div>

          <div style={rightPanelStyle}>
            <div style={rightCardStyle}>
              <div style={sectionTitleStyle}>Source Section</div>

              {selected ? (
                <div style={sourceBoxStyle}>
                  <div style={sourceHeaderStyle}>
                    <div style={sourceNameStyle}>{selectedRunnerName}</div>

                    {isSuspended ? (
                      <div style={suspendedBadgeStyle}>Suspended</div>
                    ) : isBallRunning ? (
                      <div style={ballRunningBadgeStyle}>Ball Running</div>
                    ) : null}
                  </div>

                  <div style={sourceRatesGridStyle}>
                    <div style={sourceRateItemStyle}>
                      <div style={sourceRateLabelStyle}>Back</div>
                      <div style={sourceBackValueStyle}>{selectedBackPrice}</div>
                      <div style={sourceSizeStyle}>Size: {selectedBackSize}</div>
                    </div>

                    <div style={sourceRateItemStyle}>
                      <div style={sourceRateLabelStyle}>Lay</div>
                      <div style={sourceLayValueStyle}>{selectedLayPrice}</div>
                      <div style={sourceSizeStyle}>Size: {selectedLaySize}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={emptyStyle}>No source selected</div>
              )}
            </div>

            <div style={rightCardStyle}>
              <div style={sectionTitleStyle}>Calculation Fields</div>

              <div style={twoFieldRowStyle}>
                <FieldRowCompact
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

                <FieldRowCompact
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
              </div>

              <div style={fullWidthRowStyle}>
                <div style={compactLabelStyle}>Title</div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={twoFieldRowStyle}>
                <FieldRowCompact
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

                <FieldRowCompact
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
              </div>

              <div style={twoFieldRowStyle}>
                <FieldRowCompact
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

                <FieldRowCompact
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
              </div>

              <div style={twoFieldRowStyle}>
                <FieldRowCompact
                  label="Current Mean"
                  field={<StaticValue value={calculatedPreview.currentMean || "N/A"} />}
                />

                <FieldRowCompact
                  label="Current Std Dev"
                  field={<StaticValue value={calculatedPreview.currentStdDev || "N/A"} />}
                />
              </div>

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
      </div>
    </div>
  );
}

function FieldRowCompact({ label, field }) {
  return (
    <div style={compactFieldWrapStyle}>
      <div style={compactLabelStyle}>{label}</div>
      <div>{field}</div>
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

const pageContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  maxWidth: "1500px"
};

const topSectionStyle = {
  display: "grid",
  gridTemplateColumns: "520px 1fr",
  gap: "32px",
  alignItems: "start"
};

const leftCardStyle = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "18px"
};

const rightPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const rightCardStyle = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "18px"
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
  padding: "14px"
};

const sourceHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
  flexWrap: "wrap"
};

const sourceNameStyle = {
  fontWeight: "700",
  fontSize: "18px",
  color: "#111827"
};

const suspendedBadgeStyle = {
  background: "#dc2626",
  color: "#ffffff",
  fontWeight: "800",
  fontSize: "13px",
  padding: "8px 12px",
  borderRadius: "999px"
};

const ballRunningBadgeStyle = {
  background: "#f59e0b",
  color: "#111827",
  fontWeight: "800",
  fontSize: "13px",
  padding: "8px 12px",
  borderRadius: "999px"
};

const sourceRatesGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px"
};

const sourceRateItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const sourceRateLabelStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151"
};

const sourceBackValueStyle = {
  padding: "12px 14px",
  textAlign: "center",
  background: "#cfe2ff",
  fontWeight: "800",
  fontSize: "22px",
  borderRadius: "10px",
  color: "#111827",
  border: "1px solid #bfdbfe"
};

const sourceLayValueStyle = {
  padding: "12px 14px",
  textAlign: "center",
  background: "#ffd1dc",
  fontWeight: "800",
  fontSize: "22px",
  borderRadius: "10px",
  color: "#111827",
  border: "1px solid #f9a8d4"
};

const sourceSizeStyle = {
  textAlign: "center",
  fontSize: "14px",
  fontWeight: "700",
  color: "#4b5563",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "8px 10px"
};

const tableWrapStyle = {
  overflowX: "hidden"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed"
};

const thStyle = {
  padding: "12px 8px",
  textAlign: "center",
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "middle",
  wordBreak: "break-word"
};

const miniBackBoxStyle = {
  background: "#cfe2ff",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  padding: "8px 6px",
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box"
};

const miniLayBoxStyle = {
  background: "#ffd1dc",
  border: "1px solid #f9a8d4",
  borderRadius: "10px",
  padding: "8px 6px",
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box"
};

const miniPriceStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#111827",
  lineHeight: "1.2"
};

const miniSizeStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#374151",
  marginTop: "4px",
  lineHeight: "1.2",
  whiteSpace: "nowrap"
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

const twoFieldRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "12px"
};

const fullWidthRowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "12px"
};

const compactFieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const compactLabelStyle = {
  fontWeight: "700",
  color: "#111827"
};

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
  cursor: "pointer",
  width: "100%"
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