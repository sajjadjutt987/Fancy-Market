import React, { useMemo, useState } from "react";
import api from "../services/api";

function MarketForm({ onCalculate }) {
  const [formData, setFormData] = useState({
    marketTitle: "",
    marketId: "",
    source: "Back",
    sourceSide: "Back",
    margin: "",
    runsLine: "",
    initialMean: "",
    initialStdDev: "",
    rateDiff: "",
    totalOvers: "20",
    oversCompleted: "",
    runsScored: "",
    wicketsLost: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState({});

  const fieldErrors = useMemo(() => {
    const result = {};

    if (!formData.marketTitle.trim()) {
      result.marketTitle = "Market Title is required";
    }

    if (!formData.marketId.trim()) {
      result.marketId = "Market ID is required";
    }

    const margin = Number(formData.margin);
    if (formData.margin === "") {
      result.margin = "Margin is required";
    } else if (!Number.isFinite(margin) || margin < 0 || margin >= 1) {
      result.margin = "Margin must be between 0 and less than 1";
    }

    const runsLine = Number(formData.runsLine);
    if (formData.runsLine === "") {
      result.runsLine = "Runs Line is required";
    } else if (!Number.isFinite(runsLine) || runsLine < 0) {
      result.runsLine = "Runs Line must be a valid non negative number";
    }

    const initialMean = Number(formData.initialMean);
    if (formData.initialMean === "") {
      result.initialMean = "Initial Mean is required";
    } else if (!Number.isFinite(initialMean) || initialMean < 0) {
      result.initialMean = "Initial Mean must be a valid non negative number";
    }

    const initialStdDev = Number(formData.initialStdDev);
    if (formData.initialStdDev === "") {
      result.initialStdDev = "Initial Std Dev is required";
    } else if (!Number.isFinite(initialStdDev) || initialStdDev <= 0) {
      result.initialStdDev = "Initial Std Dev must be greater than 0";
    }

    const rateDiff = Number(formData.rateDiff);
    if (formData.rateDiff === "") {
      result.rateDiff = "Rate Diff is required";
    } else if (!Number.isFinite(rateDiff) || rateDiff < 0) {
      result.rateDiff = "Rate Diff must be a valid non negative number";
    }

    const totalOvers = Number(formData.totalOvers);
    if (formData.totalOvers === "") {
      result.totalOvers = "Total Overs is required";
    } else if (!Number.isFinite(totalOvers) || totalOvers <= 0) {
      result.totalOvers = "Total Overs must be greater than 0";
    }

    const oversCompleted = Number(formData.oversCompleted);
    if (formData.oversCompleted === "") {
      result.oversCompleted = "Overs Completed is required";
    } else if (!Number.isFinite(oversCompleted) || oversCompleted < 0) {
      result.oversCompleted = "Overs Completed must be a valid non negative number";
    } else if (Number.isFinite(totalOvers) && oversCompleted > totalOvers) {
      result.oversCompleted = "Overs Completed cannot be greater than Total Overs";
    }

    const runsScored = Number(formData.runsScored);
    if (formData.runsScored === "") {
      result.runsScored = "Runs Scored is required";
    } else if (!Number.isFinite(runsScored) || runsScored < 0) {
      result.runsScored = "Runs Scored must be a valid non negative number";
    }

    const wicketsLost = Number(formData.wicketsLost);
    if (formData.wicketsLost === "") {
      result.wicketsLost = "Wickets Lost is required";
    } else if (!Number.isFinite(wicketsLost) || wicketsLost < 0 || wicketsLost > 10) {
      result.wicketsLost = "Wickets Lost must be between 0 and 10";
    }

    return result;
  }, [formData]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sourceSide") {
      setFormData((prev) => ({
        ...prev,
        sourceSide: value,
        source: value
      }));
      return;
    }

    setFormData((prev) => ({
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
      marketTitle: true,
      marketId: true,
      margin: true,
      runsLine: true,
      initialMean: true,
      initialStdDev: true,
      rateDiff: true,
      totalOvers: true,
      oversCompleted: true,
      runsScored: true,
      wicketsLost: true
    });
  };

  const handleSubmit = async () => {
    try {
      setErrors([]);

      if (!isFormValid) {
        markAllTouched();
        setErrors(["Please fix the highlighted fields before submitting"]);
        return;
      }

      setLoading(true);

      const payload = {
        ...formData,
        margin: Number(formData.margin),
        runsLine: Number(formData.runsLine),
        initialMean: Number(formData.initialMean),
        initialStdDev: Number(formData.initialStdDev),
        rateDiff: Number(formData.rateDiff),
        totalOvers: Number(formData.totalOvers),
        oversCompleted: Number(formData.oversCompleted),
        runsScored: Number(formData.runsScored),
        wicketsLost: Number(formData.wicketsLost)
      };

      const response = await api.post("/markets/calculate", payload);

      if (onCalculate) {
        onCalculate(response.data.data);
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setErrors(apiErrors);
      } else {
        setErrors(["Something went wrong while calculating the market"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {errors.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b"
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Please fix these issues:
          </div>

          {errors.map((item, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {item}
            </div>
          ))}
        </div>
      )}

      <SectionTitle title="Basic Market Info" />

      <Field
        label="Market Title"
        name="marketTitle"
        value={formData.marketTitle}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        placeholder="Enter market title"
        error={touched.marketTitle ? fieldErrors.marketTitle : ""}
      />

      <Field
        label="Market ID"
        name="marketId"
        value={formData.marketId}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        placeholder="Enter market ID"
        error={touched.marketId ? fieldErrors.marketId : ""}
      />

      <Field
        label="Source"
        name="source"
        value={formData.source}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        placeholder="Source"
        readOnly
      />

      <div style={{ marginBottom: "14px" }}>
        <label style={labelStyle}>Source Side</label>
        <select
          name="sourceSide"
          value={formData.sourceSide}
          onChange={handleChange}
          onBlur={handleBlur}
          style={inputStyle}
        >
          <option value="Back">Back</option>
          <option value="Lay">Lay</option>
        </select>
      </div>

      <SectionTitle title="Pricing Inputs" />

      <Field
        label="Margin"
        name="margin"
        value={formData.margin}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="0.05"
        error={touched.margin ? fieldErrors.margin : ""}
      />

      <Field
        label="Runs Line"
        name="runsLine"
        value={formData.runsLine}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="170"
        error={touched.runsLine ? fieldErrors.runsLine : ""}
      />

      <Field
        label="Initial Mean"
        name="initialMean"
        value={formData.initialMean}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="170"
        error={touched.initialMean ? fieldErrors.initialMean : ""}
      />

      <Field
        label="Initial Std Dev"
        name="initialStdDev"
        value={formData.initialStdDev}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="15"
        error={touched.initialStdDev ? fieldErrors.initialStdDev : ""}
      />

      <Field
        label="Rate Diff"
        name="rateDiff"
        value={formData.rateDiff}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="0.1"
        error={touched.rateDiff ? fieldErrors.rateDiff : ""}
      />

      <SectionTitle title="Live Match Inputs" />

      <Field
        label="Total Overs"
        name="totalOvers"
        value={formData.totalOvers}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="20"
        error={touched.totalOvers ? fieldErrors.totalOvers : ""}
      />

      <Field
        label="Overs Completed"
        name="oversCompleted"
        value={formData.oversCompleted}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="10"
        error={touched.oversCompleted ? fieldErrors.oversCompleted : ""}
      />

      <Field
        label="Runs Scored"
        name="runsScored"
        value={formData.runsScored}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="85"
        error={touched.runsScored ? fieldErrors.runsScored : ""}
      />

      <Field
        label="Wickets Lost"
        name="wicketsLost"
        value={formData.wicketsLost}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        placeholder="2"
        error={touched.wicketsLost ? fieldErrors.wicketsLost : ""}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !isFormValid}
        style={{
          width: "100%",
          background: loading || !isFormValid ? "#9ca3af" : "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: loading || !isFormValid ? "not-allowed" : "pointer",
          marginTop: "8px"
        }}
      >
        {loading ? "Calculating..." : "Calculate Market"}
      </button>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3
      style={{
        marginTop: "18px",
        marginBottom: "12px",
        fontSize: "15px",
        fontWeight: "bold",
        color: "#374151",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "6px"
      }}
    >
      {title}
    </h3>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  type,
  placeholder,
  readOnly = false,
  error = ""
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          ...inputStyle,
          background: readOnly ? "#f9fafb" : "#ffffff",
          border: error ? "1px solid #dc2626" : "1px solid #d1d5db"
        }}
      />
      {error ? (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#dc2626",
            fontWeight: "500"
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none"
};

export default MarketForm;