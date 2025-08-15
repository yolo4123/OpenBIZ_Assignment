import React from "react";
type Props = { current: 1 | 2 };
export default function Progress({ current }: Props) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div className={current === 1 ? "step active" : "step"}><div className="step-num">1</div><div>Step 1</div></div>
      <div className={current === 2 ? "step active" : "step"}><div className="step-num">2</div><div>Step 2</div></div>
    </div>
  );
}