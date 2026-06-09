interface Props {
  current: number; // 1始まり
  total: number;
}

/** 進捗バー（現在の質問番号 / 全体） */
export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress">
      <div className="progress-meta">
        <span>
          質問 {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-bar"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
