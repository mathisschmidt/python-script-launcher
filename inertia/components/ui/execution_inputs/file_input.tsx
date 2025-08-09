import {FileInputInfos} from "~/types/project_infos";

type FileInputProps = {
  input_infos: FileInputInfos;
  on_change?: (name: string, files: FileList | null) => void;
  on_remove?: (name: string, index: number) => void;
  files?: FileList | null;
}

export default function FileInput(props: FileInputProps) {
  const { input_infos, on_change, files, on_remove } = props;
  const fieldId = `input-file-${input_infos.name}`;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="input-group">
      <label className="form-label" htmlFor={fieldId}>
        {input_infos.description || input_infos.name}
        {input_infos.required ? '<span style="color: var(--color-error);">*</span>' : ''}
      </label>
      <div className={`file-upload-area ${input_infos.multiple ? 'file-upload-multiple' : ''}`} data-input={input_infos.name}>
        <div className="upload-content">
          <i data-lucide="upload"></i>
          <h4>Drop ${input_infos.multiple ? 'files': 'file'} here</h4>
          <p>or click to browse</p>
          <input
            type="file"
            id={fieldId}
            multiple={input_infos.multiple}
            className="hidden"
            required={input_infos.required}
            onChange={(e) => {
              const files = e.target.files;
              if (on_change) {
                on_change(input_infos.name, files);
              }
            }}
          />
        </div>
        <div className="file-list">
          {files && Array.from(files).map((file, index) => (
            <div className="file-item">
              <span>{file.name} ({formatFileSize(file.size)})</span>
              <button type="button" className="file-remove" onClick={() => on_remove? on_remove(input_infos.name, index) : null}>
                <i data-lucide="x"></i>
              </button>
            </div>
        ))}
      </div>
    </div>
    </div>
  )
}
