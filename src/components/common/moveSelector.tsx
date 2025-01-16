import { Move } from "@/model/move";
import { FC, useMemo } from "react";

interface MoveSelectorProps {
  value: Move;
  onChange: (move: Move) => void;
  disabled?: boolean;
}

const MoveSelector: FC<MoveSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const moveOptions = useMemo(
    () =>
      Object.keys(Move)
        .filter((key) => isNaN(Number(key))) // Do not display the enum numeric keys
        .map((key) => (
          <option key={key} value={Move[key as keyof typeof Move]}>
            {key}
          </option>
        )),
    []
  );

  return (
    <div>
      <label>Move:</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Move)}
        disabled={disabled}
      >
        {moveOptions}
      </select>
    </div>
  );
};

export default MoveSelector;
