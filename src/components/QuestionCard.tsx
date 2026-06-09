import type { Question } from "@/diagnoses/types";

interface Props {
  question: Question;
  index: number; // 0始まり
  total: number;
  selected?: string;
  onSelect: (choiceId: string) => void;
  onBack?: () => void;
  showBack: boolean;
}

/** 1問ずつ表示する質問カード（選択式・1タップで進む） */
export default function QuestionCard({
  question,
  index,
  selected,
  onSelect,
  onBack,
  showBack,
}: Props) {
  return (
    <div className="card fade-in" key={question.id}>
      <span className="question-no">Q{index + 1}</span>
      <h2 className="question-text">{question.text}</h2>
      {question.hint && <p className="question-hint">{question.hint}</p>}

      <div className="choices" role="radiogroup" aria-label={question.text}>
        {question.choices.map((choice) => {
          const isSelected = selected === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`choice${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(choice.id)}
            >
              <span className="choice-key">{choice.id}</span>
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>

      {showBack && (
        <div className="nav-row">
          <button
            type="button"
            className="btn btn-back"
            onClick={onBack}
            aria-label="前の質問に戻る"
          >
            ←
          </button>
          <span style={{ flex: 1, alignSelf: "center", fontSize: 13, color: "var(--ink-faint)" }}>
            選ぶと次の質問に進みます
          </span>
        </div>
      )}
    </div>
  );
}
