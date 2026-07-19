import { SeededFlowlines } from "./seeded-flowlines";
import "./preview.css";

export default function SeededFlowlinesPreview() {
  return (
    <SeededFlowlines className="tb-seeded-flowlines-preview">
      <div className="tb-seeded-flowlines-preview__copy">
        <h2>Show directional flow behind a process overview.</h2>
        <p>
          Thirty-four deterministic paths are rasterized once after resize.
          Each frame redraws that cached field and only eight short trail
          segments per path.
        </p>
      </div>
    </SeededFlowlines>
  );
}
