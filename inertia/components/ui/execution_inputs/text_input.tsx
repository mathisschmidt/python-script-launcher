import {TextInputInfos} from "~/types/project_infos";

type TextInputProps = {
  input_infos: TextInputInfos;
  onChange?: (name: string, value: string) => void;
}

export default function TextInput(props: TextInputProps) {
  const { input_infos, onChange } = props;
  const fieldId = `input-text-${input_infos.name}`;

  return (
    <div className="input-group">
      <label className="form-label" htmlFor={fieldId}>
        ${input_infos.description || input_infos.name}
        ${input_infos.required ? '<span style="color: var(--color-error);">*</span>' : ''}
      </label>
      <input
        type="text"
        id={fieldId}
        className="form-control"
        name={input_infos.name}
        value={input_infos.default_value || ''}
        onChange={(e) => {
          if (onChange) {
            onChange(input_infos.name, e.target.value);
          }
        }}
        required={input_infos.required}
        placeholder={`Enter ${input_infos.name}...`}
      />
    </div>
  )
}
