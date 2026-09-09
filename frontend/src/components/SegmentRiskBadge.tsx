import "./SegmentRiskBadge.css";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

const getRiskLevel = (score: number) => {
  if (score < 30) return { label: "Low", className: "risk-low" };
  if (score < 60) return { label: "Medium", className: "risk-medium" };
  if (score < 80) return { label: "High", className: "risk-high" };
  return { label: "Severe", className: "risk-severe" };
};

const SegmentRiskBadge = ({ score, size = "md" }: Props) => {
  const level = getRiskLevel(score);
  
  return (
    <span className={`pill risk-badge ${level.className} size-${size}`}>
      {level.label} Risk
    </span>
  );
};

export default SegmentRiskBadge;
