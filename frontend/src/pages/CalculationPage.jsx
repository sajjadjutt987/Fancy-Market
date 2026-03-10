import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CalculationPage() {
  const { marketId } = useParams();
  const navigate = useNavigate();

  const [marketData, setMarketData] = useState(null);
  const [result, setResult] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    sourceSide: "Back",
    margin: "0",
    title: "",
    runs: "",
    initialMean: "",
    initialStdDev: "",
    rateDiff: "0.10"
  });

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setFetchError("");
        const response = await api.get(`/markets/source/${marketId}`);
        const data = response.data.data;

        setMarketData(data);

        setForm((prev) => {
          const next = { ...prev };
          if (!prev.title.trim()) {
            next.title = data?.marketName || "";
          }
          return next;
        });
      } catch (err) {
        setFetchError("Unable to fetch market data");
      }
    };

    fetchMarket();
  }, [marketId]);

  const fieldErrors = useMemo(() => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Title is required";
    }

    const margin = Number(form.margin);
    if (form.margin === "") {
      errors.margin = "Margin is required";
    } else if (!Number.isFinite(margin) || margin < 0 || margin > 100) {
      errors.margin = "Margin must be between 0 and 100";
    }

    const runs = Number(form.runs);
    if (form.runs === "") {
      errors.runs = "Runs is required";
    } else if (!Number.isFinite(runs) || runs < 0) {
      errors.runs = "Runs must be a non negative number";
    }

    const initialMean = Number(form.initialMean);
    if (form.initialMean === "") {
      errors.initialMean = "Initial Mean is required";
    } else if (!Number.isFinite(initialMean) || initialMean <= 0) {
      errors.initialMean = "Initial Mean must be greater than 0";
    }

    const initialStdDev = Number(form.initialStdDev);
    if (form.initialStdDev === "") {
      errors.initialStdDev = "Initial Std Dev is required";
    } else if (!Number.isFinite(initialStdDev) || initialStdDev <= 0) {
      errors.initialStdDev = "Initial Std Dev must be greater than 0";
    }

    const rateDiff = Number(form.rateDiff);
    if (form.rateDiff === "") {
      errors.rateDiff = "Rate Diff is required";
    } else if (!Number.isFinite(rateDiff) || rateDiff < 0) {
      errors.rateDiff = "Rate Diff must be a non negative number";
    }

    return errors;
  }, [form]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const calculatedPreview = useMemo(() => {
    const initialMean = Number(form.initialMean);
    const initialStdDev = Number(form.initialStdDev);

    const sourceBack =
      marketData?.sourceBack != null ? Number(marketData.sourceBack) : NaN;
    const sourceLay =
      marketData?.sourceLay != null ? Number(marketData.sourceLay) : NaN;

    const currentMean = form.sourceSide === "Lay" ? sourceLay : sourceBack;

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

    const currentStdDev = currentMean * (initialStdDev / initialMean);

    return {
      currentMean: Number(currentMean.toFixed(2)),
      currentStdDev: Number(currentStdDev.toFixed(2))
    };
  }, [
    form.sourceSide,
    form.initialMean,
    form.initialStdDev,
    marketData?.sourceBack,
    marketData?.sourceLay
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  };

  const markAllTouched = () => {
    setTouched({
      margin: true,
      title: true,
      runs: true,
      initialMean: true,
      initialStdDev: true,
      rateDiff: true
    });
  };

  const handleCalculate = async () => {
    try {
      setSubmitError("");

      if (!isFormValid) {
        markAllTouched();
        setSubmitError("Please fix the highlighted fields");
        return;
      }

      const response = await api.post("/markets/calculate", {
        marketId,
        marketTitle: form.title,
        title: form.title,
        source: form.sourceSide,
        sourceSide: form.sourceSide,
        margin: Number(form.margin) / 100,
        runsLine: Number(form.runs),
        runs: Number(form.runs),
        initialMean: Number(form.initialMean),
        initialStdDev: Number(form.initialStdDev),
        rateDiff: Number(form.rateDiff)
      });

      setResult(response.data.data);
    } catch (err) {
      setSubmitError("Calculation failed");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={pageShellStyle}>
        <div style={topBarStyle}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={backButtonStyle}
          >
            ← Back
          </button>

          <div>
            <div style={pageEyebrowStyle}>Fancy Line Market</div>
            <div style={pageTitleStyle}>Market {marketId}</div>
          </div>
        </div>

        <div style={marketHeaderCardStyle}>
          {fetchError ? (
            <div style={errorTextStyle}>{fetchError}</div>
          ) : marketData ? (
            <div style={marketStripStyle}>
              <div style={marketStripLeftStyle}>
                <div style={marketStripLabelStyle}>Source Market</div>
                <div style={marketStripTitleStyle}>
                  {marketData.marketName || "Market"}
                </div>
              </div>

              <div style={marketRateBlockStyle}>
                <div style={marketRateBlockHeaderStyle}>Back</div>
                <div style={marketBackValueStyle}>
                  {marketData.sourceBack ?? "N/A"}
                </div>
              </div>

              <div style={marketRateBlockStyle}>
                <div style={marketRateBlockHeaderStyle}>Lay</div>
                <div style={marketLayValueStyle}>
                  {marketData.sourceLay ?? "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div style={loadingTextStyle}>Loading market...</div>
          )}
        </div>

        {submitError ? <div style={errorBoxStyle}>{submitError}</div> : null}

        <div style={layoutStyle}>
          <div style={leftPanelStyle}>
            <div style={panelHeaderStyle}>Market Inputs</div>

            <div style={sheetBoxStyle}>
              <SheetRow
                label="Source Side"
                field={
                  <select
                    name="sourceSide"
                    value={form.sourceSide}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={sheetInputStyle}
                  >
                    <option value="Back">Back</option>
                    <option value="Lay">Lay</option>
                  </select>
                }
                sideValue={
                  form.sourceSide === "Lay"
                    ? marketData?.sourceLay ?? "N/A"
                    : marketData?.sourceBack ?? "N/A"
                }
              />

              <SheetRow
                label="Margin"
                field={
                  <FieldInput
                    name="margin"
                    value={form.margin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.margin ? fieldErrors.margin : ""}
                  />
                }
              />

              <SheetRow
                label="Title"
                field={
                  <FieldInput
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title ? fieldErrors.title : ""}
                  />
                }
              />

              <SheetRow
                label="Runs"
                field={
                  <FieldInput
                    name="runs"
                    value={form.runs}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.runs ? fieldErrors.runs : ""}
                  />
                }
              />

              <SheetRow
                label="Initial Mean"
                field={
                  <FieldInput
                    name="initialMean"
                    value={form.initialMean}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.initialMean ? fieldErrors.initialMean : ""}
                  />
                }
              />

              <SheetRow
                label="Initial Std Dev"
                field={
                  <FieldInput
                    name="initialStdDev"
                    value={form.initialStdDev}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.initialStdDev ? fieldErrors.initialStdDev : ""}
                  />
                }
              />

              <SheetRow
                label="Rate Diff"
                field={
                  <FieldInput
                    name="rateDiff"
                    value={form.rateDiff}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.rateDiff ? fieldErrors.rateDiff : ""}
                  />
                }
              />

              <SheetRow
                label="Current Mean"
                field={<StaticCell value={calculatedPreview.currentMean || "N/A"} />}
              />

              <SheetRow
                label="Current Std Dev"
                field={<StaticCell value={calculatedPreview.currentStdDev || "N/A"} />}
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={!isFormValid}
              style={{
                ...calculateButtonStyle,
                opacity: !isFormValid ? 0.55 : 1,
                cursor: !isFormValid ? "not-allowed" : "pointer"
              }}
            >
              Calculate
            </button>
          </div>

          <div style={rightPanelStyle}>
            <div style={displayCaptionStyle}>Display as this</div>

            {result ? (
              <div style={lgDisplayBoxStyle}>
                <div style={lgTitleStyle}>
                  {result.displayTitle || `${form.title} :: ${form.runs} runs`}
                </div>

                <div style={lgHeaderRowStyle}>
                  <div style={lgBlankHeadStyle}></div>
                  <div style={lgBackHeadStyle}>Back</div>
                  <div style={lgLayHeadStyle}>Lay</div>
                </div>

                <div style={lgDataRowStyle}>
                  <div style={lgRowLabelStyle}>Yes</div>
                  <div style={lgBackCellStyle}>
                    {result.backYes ?? result.yesBack ?? "N/A"}
                  </div>
                  <div style={lgLayCellStyle}>
                    {result.layYes ?? result.yesLay ?? "N/A"}
                  </div>
                </div>

                <div style={lgDataRowStyle}>
                  <div style={lgRowLabelStyle}>No</div>
                  <div style={lgBackCellStyle}>
                    {result.backNo ?? result.noBack ?? "N/A"}
                  </div>
                  <div style={lgLayCellStyle}>
                    {result.layNo ?? result.noLay ?? "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={emptyDisplayStyle}>
                Fill inputs and click Calculate to see the final display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetRow({ label, field, sideValue = "" }) {
  return (
    <div style={sheetRowStyle}>
      <div style={sheetLabelStyle}>{label}</div>
      <div style={sheetFieldStyle}>{field}</div>
      <div style={sheetSideValueStyle}>{sideValue}</div>
    </div>
  );
}

function FieldInput({ name, value, onChange, onBlur, error }) {
  return (
    <>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          ...sheetInputStyle,
          border: error ? "1px solid #ff6b6b" : "1px solid #55616d"
        }}
      />
      {error ? <div style={inlineErrorStyle}>{error}</div> : null}
    </>
  );
}

function StaticCell({ value }) {
  return <div style={staticCellStyle}>{value}</div>;
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #3a3f47 0%, #2f333a 35%, #262a31 100%)",
  padding: "20px",
  boxSizing: "border-box",
  color: "#f3f4f6"
};

const pageShellStyle = {
  maxWidth: "1280px",
  margin: "0 auto"
};

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "18px"
};

const backButtonStyle = {
  border: "1px solid #5c6672",
  background: "linear-gradient(180deg, #434954 0%, #373d47 100%)",
  color: "#f9fafb",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
};

const pageEyebrowStyle = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#9aa4b2",
  marginBottom: "2px"
};

const pageTitleStyle = {
  fontSize: "34px",
  fontWeight: "800",
  color: "#ffffff",
  lineHeight: 1.1
};

const marketHeaderCardStyle = {
  background: "linear-gradient(180deg, #353a42 0%, #2c3138 100%)",
  border: "1px solid #4f5863",
  borderRadius: "14px",
  padding: "14px 16px",
  marginBottom: "16px",
  boxShadow: "0 8px 22px rgba(0,0,0,0.22)"
};

const marketStripStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 110px 110px",
  gap: "12px",
  alignItems: "stretch"
};

const marketStripLeftStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const marketStripLabelStyle = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9aa4b2",
  marginBottom: "4px"
};

const marketStripTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#ffffff"
};

const marketRateBlockStyle = {
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #4f5863"
};

const marketRateBlockHeaderStyle = {
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "700",
  color: "#111827",
  background: "#d1d5db",
  padding: "6px 8px"
};

const marketBackValueStyle = {
  textAlign: "center",
  padding: "14px 8px",
  fontSize: "24px",
  background: "linear-gradient(180deg, #8fcbff 0%, #69b7ff 100%)",
  color: "#0f172a",
  fontWeight: "800"
};

const marketLayValueStyle = {
  textAlign: "center",
  padding: "14px 8px",
  fontSize: "24px",
  background: "linear-gradient(180deg, #ffc0d0 0%, #ff93b0 100%)",
  color: "#0f172a",
  fontWeight: "800"
};

const loadingTextStyle = {
  color: "#d1d5db"
};

const errorTextStyle = {
  color: "#ff9d9d"
};

const errorBoxStyle = {
  background: "rgba(127, 29, 29, 0.35)",
  border: "1px solid #b94a48",
  color: "#ffe0e0",
  padding: "12px 14px",
  borderRadius: "10px",
  marginBottom: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.18)"
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "540px 360px",
  gap: "34px",
  alignItems: "start"
};

const leftPanelStyle = {
  background: "linear-gradient(180deg, #353a42 0%, #2b3038 100%)",
  border: "1px solid #4f5863",
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.24)"
};

const panelHeaderStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: "12px"
};

const sheetBoxStyle = {
  display: "grid",
  gap: "4px"
};

const sheetRowStyle = {
  display: "grid",
  gridTemplateColumns: "140px 170px 90px",
  alignItems: "center",
  gap: "10px"
};

const sheetLabelStyle = {
  fontSize: "15px",
  color: "#ffffff",
  fontWeight: "600"
};

const sheetFieldStyle = {
  minHeight: "38px"
};

const sheetSideValueStyle = {
  fontSize: "18px",
  color: "#ffffff",
  fontWeight: "700"
};

const sheetInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  border: "1px solid #55616d",
  background: "linear-gradient(180deg, #dce9d3 0%, #cedcbf 100%)",
  color: "#111827",
  fontSize: "17px",
  height: "38px",
  borderRadius: "8px",
  outline: "none"
};

const staticCellStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  border: "1px dashed #8b5cf6",
  background: "#ffffff",
  color: "#111827",
  fontSize: "17px",
  height: "38px",
  borderRadius: "8px"
};

const inlineErrorStyle = {
  marginTop: "4px",
  color: "#ffb4b4",
  fontSize: "11px"
};

const calculateButtonStyle = {
  marginTop: "18px",
  width: "170px",
  border: "none",
  background: "linear-gradient(180deg, #377dff 0%, #2458d8 100%)",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "12px 16px",
  fontSize: "16px",
  fontWeight: "800",
  boxShadow: "0 8px 18px rgba(37,99,235,0.35)"
};

const rightPanelStyle = {
  paddingTop: "18px"
};

const displayCaptionStyle = {
  textAlign: "center",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  marginBottom: "14px"
};

const lgDisplayBoxStyle = {
  width: "290px",
  margin: "0 auto",
  border: "1px solid #66707c",
  borderRadius: "14px",
  overflow: "hidden",
  background: "linear-gradient(180deg, #3a3f47 0%, #2f343c 100%)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.28)"
};

const lgTitleStyle = {
  textAlign: "center",
  fontSize: "24px",
  color: "#ffffff",
  fontWeight: "800",
  lineHeight: 1.15,
  padding: "14px 12px 10px 12px",
  borderBottom: "1px solid #5a6470"
};

const lgHeaderRowStyle = {
  display: "grid",
  gridTemplateColumns: "70px 110px 110px",
  alignItems: "center",
  background: "#2a2f36"
};

const lgBlankHeadStyle = {};

const lgBackHeadStyle = {
  textAlign: "center",
  fontSize: "18px",
  color: "#cfe8ff",
  fontWeight: "800",
  padding: "10px 0"
};

const lgLayHeadStyle = {
  textAlign: "center",
  fontSize: "18px",
  color: "#ffd1dc",
  fontWeight: "800",
  padding: "10px 0"
};

const lgDataRowStyle = {
  display: "grid",
  gridTemplateColumns: "70px 110px 110px",
  alignItems: "stretch"
};

const lgRowLabelStyle = {
  fontSize: "28px",
  color: "#ffffff",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#31363e",
  borderTop: "1px solid #5a6470"
};

const lgBackCellStyle = {
  textAlign: "center",
  fontSize: "34px",
  fontWeight: "900",
  color: "#0f172a",
  background: "linear-gradient(180deg, #9ed3ff 0%, #6bb7ff 100%)",
  padding: "14px 6px",
  borderTop: "1px solid #5a6470",
  borderLeft: "1px solid #5a6470"
};

const lgLayCellStyle = {
  textAlign: "center",
  fontSize: "34px",
  fontWeight: "900",
  color: "#111827",
  background: "linear-gradient(180deg, #ffc2d1 0%, #ff8daa 100%)",
  padding: "14px 6px",
  borderTop: "1px solid #5a6470",
  borderLeft: "1px solid #5a6470"
};

const emptyDisplayStyle = {
  width: "290px",
  margin: "0 auto",
  padding: "20px",
  border: "1px dashed #7c8794",
  borderRadius: "14px",
  textAlign: "center",
  color: "#d1d5db",
  background: "rgba(58,63,71,0.55)"
};

export default CalculationPage;