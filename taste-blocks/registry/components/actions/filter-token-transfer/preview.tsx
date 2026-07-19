import { FilterTokenTransfer } from "./filter-token-transfer";
import "./preview.css";

const filters = [
  { id: "identity", label: "Identity" },
  { id: "editorial", label: "Editorial" },
  { id: "motion", label: "Motion" },
  { id: "systems", label: "Design systems" },
  { id: "web", label: "Web" },
];

export default function FilterTokenTransferPreview() {
  return (
    <div className="tb-token-transfer-preview">
      <FilterTokenTransfer tokens={filters} defaultSelected={["identity", "motion"]} />
    </div>
  );
}
