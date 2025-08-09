import {FileInputInfos} from "~/types/projectInfos";
import {Upload, X} from "lucide-react";
import {useRef, useState} from "react";

type FileInputProps = {
  inputInfos: FileInputInfos;
  onChange?: (name: string, files: FileList | null) => void;
}

export default function FileInput(props: FileInputProps) {
  const { inputInfos, onChange } = props;
  const [files, setFiles] = useState<FileList | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldId = `input-file-${inputInfos.name}`;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only remove dragover if we're actually leaving the drop area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0 && onChange) {
      // If not multiple, only take the first file
      if (!inputInfos.multiple && droppedFiles.length > 1) {
        const singleFile = new DataTransfer();
        singleFile.items.add(droppedFiles[0]);
        onChange(inputInfos.name, singleFile.files);
      } else {
        onChange(inputInfos.name, droppedFiles);
      }

      // Update the actual input element's files
      if (fileInputRef.current) {
        fileInputRef.current.files = droppedFiles;
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
    if (onChange) {
      onChange(inputInfos.name, selectedFiles);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    if (!files) return;

    const index = Array.from(files).findIndex(file => file.name === fileName);

    const newFiles = Array.from(files);
    newFiles.splice(index, 1);

    const updatedFileList = new DataTransfer();
    newFiles.forEach(file => updatedFileList.items.add(file));

    setFiles(updatedFileList.files);
    if (onChange) {
      onChange(inputInfos.name, updatedFileList.files);
    }
  }

  return (
    <div className="input-group">
      <label className="form-label" htmlFor={fieldId}>
        {inputInfos.description || inputInfos.name}
        {inputInfos.required ? <span style={{ color: "var(--color-error)" }}>*</span> : ''}
      </label>
      <div
        className={`file-upload-area ${files && files.length > 0 ? "has-files": ''} ${inputInfos.multiple ? 'file-upload-multiple' : ''} ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="upload-content">
          <Upload className="w-4 h-4" />
          <h4>Drop {inputInfos.multiple ? 'files': 'file'} here</h4>
          <p>or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            id={fieldId}
            multiple={inputInfos.multiple}
            // required={inputInfos.required}
            onChange={handleFileChange}
          />
        </div>
        <div className="file-list">
          {files && Array.from(files).map((file) => (
            <div className="file-item" key={file.name}>
              <span>{file.name} ({formatFileSize(file.size)})</span>
              <button
                type="button"
                className="file-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile(file.name)
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
        ))}
      </div>
    </div>
    </div>
  )
}
