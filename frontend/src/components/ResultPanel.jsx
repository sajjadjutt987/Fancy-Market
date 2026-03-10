import React from "react";

function ResultPanel({ result }) {
  if (!result) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "10px",
            color: "#111827"
          }}
        >
          Market Output
        </h3>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "14px"
          }}
        >
          Fill the market form and click Calculate Market to view summary and ladder pricing.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f4f4f4",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <h3 style={{ marginTop: 0 }}>Market Summary</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <div style={summaryCardStyle}>
          <div style={labelStyle}>Market Title</div>
          <div style={valueStyle}>{result.marketTitle}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Runner Name</div>
          <div style={valueStyle}>{result.runnerName || "N/A"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Market ID</div>
          <div style={valueStyle}>{result.marketId}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source Side</div>
          <div style={valueStyle}>{result.sourceSide}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Runs Line</div>
          <div style={valueStyle}>{result.runsLine}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Current Mean</div>
          <div style={valueStyle}>{result.currentMean}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Current Std Dev</div>
          <div style={valueStyle}>{result.currentStdDev}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Back Price</div>
          <div style={{ ...valueStyle, color: "#0b5ed7" }}>{result.backPrice}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Lay Price</div>
          <div style={{ ...valueStyle, color: "#198754" }}>{result.layPrice}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Yes Probability</div>
          <div style={valueStyle}>{result.yesProbability}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source API Used</div>
          <div style={valueStyle}>{String(result.sourceApiUsed)}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source Market ID</div>
          <div style={valueStyle}>{result.sourceMarketId || "N/A"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source Back</div>
          <div style={valueStyle}>{result.sourceBack ?? "N/A"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source Lay</div>
          <div style={valueStyle}>{result.sourceLay ?? "N/A"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Source Note</div>
          <div style={valueStyle}>{result.sourceNote || "N/A"}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: "12px" }}>Market Ladder</h3>

      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          overflowX: "auto",
          overflowY: "hidden",
          background: "#ffffff"
        }}
      >
        <div style={{ minWidth: "900px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr 1fr",
              background: "#1f2937",
              color: "#ffffff",
              fontWeight: "bold",
              padding: "12px 10px"
            }}
          >
            <div>Runs Line</div>
            <div>Yes Prob</div>
            <div>No Prob</div>
            <div>Yes Odds</div>
            <div>No Odds</div>
            <div>Back</div>
            <div>Lay</div>
          </div>

          {result.ladder &&
            result.ladder.map((row, index) => {
              const isSelectedLine = Number(row.runsLine) === Number(result.runsLine);

              return (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                    padding: "10px",
                    alignItems: "center",
                    borderTop: "1px solid #ececec",
                    background: isSelectedLine ? "#fff8e1" : "#ffffff"
                  }}
                >
                  <div
                    style={{
                      fontWeight: isSelectedLine ? "bold" : "normal",
                      color: isSelectedLine ? "#b26a00" : "#111827"
                    }}
                  >
                    {row.runsLine}
                  </div>

                  <div>{row.yesProbability}</div>
                  <div>{row.noProbability}</div>
                  <div>{row.yesOdds}</div>
                  <div>{row.noOdds}</div>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: "72px",
                        textAlign: "center",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#cfe2ff",
                        color: "#084298",
                        fontWeight: "bold"
                      }}
                    >
                      {row.backPrice}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: "72px",
                        textAlign: "center",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#d1e7dd",
                        color: "#0f5132",
                        fontWeight: "bold"
                      }}
                    >
                      {row.layPrice}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const summaryCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "12px"
};

const labelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "6px"
};

const valueStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#111827"
};

export default ResultPanel;