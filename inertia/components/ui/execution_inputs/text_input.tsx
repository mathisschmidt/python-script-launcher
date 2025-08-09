import {TextInputInfos} from "~/types/schemas";
import {useState} from "react";

type TextInputProps = {
  inputInfos: TextInputInfos;
  onChange?: (name: string, value: string) => void;
}

export default function TextInput(props: TextInputProps) {
  const { inputInfos, onChange } = props;
  const fieldId = `input-text-${inputInfos.name}`;
  const [currentValue, setCurrentValue] = useState(inputInfos.defaultValue || '');

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
    if (onChange) {
      onChange(inputInfos.name, e.target.value);
    }
  }

  return (
    <div className="input-group" key={fieldId}>
      <label className="form-label" htmlFor={fieldId}>
        {inputInfos.description || inputInfos.name}
        {inputInfos.required ? <span style={{ color: "var(--color-error)" }}>*</span> : ''}
      </label>
      <input
        type="text"
        id={fieldId}
        className="form-control"
        name={inputInfos.name}
        value={currentValue}
        onChange={handleOnChange}
        required={inputInfos.required}
        placeholder={`Enter ${inputInfos.name}...`}
      />
    </div>
  )
}
