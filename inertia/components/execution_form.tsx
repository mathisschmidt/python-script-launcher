import {useForm} from "@inertiajs/react";
import {ProjectInfos, RunExecutionAnswer} from "~/types/schemas";
import {Loader, Play} from "lucide-react";
import FileInput from "~/components/ui/execution_inputs/file_input";
import TextInput from "~/components/ui/execution_inputs/text_input";
import axios from 'axios';
import {useState} from "react";
import {toast} from "react-toastify";

// TODO: if succeed block button run script

type ExecutionFormProps = {
  project_infos: ProjectInfos;
  onSucceed?: (executionId: string) => void;
}

export default function ExecutionForm(props: ExecutionFormProps) {
  const { project_infos, onSucceed } = props;
  const [processing, setProcessing] = useState(false);

  const getInitialData = () => {
    const initialData: Record<string, any> = {}
    initialData['project_id'] = project_infos.id

    project_infos.inputs.forEach(input => {
      if (input.type === 'file') {
        initialData[input.name] = null
      }
      if (input.type === 'text') {
        initialData[input.name] = input.defaultValue || ''
      }
    })
    return initialData
  }

  const { data, setData } = useForm(getInitialData())

  const handleInputChange = (key: string, value: any) => {
    setData(key, value)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setProcessing(true);

    // Custom validation for required file inputs
    for (const input of project_infos.inputs) {
      if (input.type === 'file' && input.required) {
        const fileData = data[input.name];
        // Check if file data is missing, null, undefined, or empty
        if (!fileData || (fileData instanceof FileList && fileData.length === 0) ||
          (Array.isArray(fileData) && fileData.length === 0)) {
          alert(`${input.description || input.name} is required`);
          return;
        }
      }
    }

    // Check if we have any file inputs
    const hasFiles = project_infos.inputs.some(input =>
      input.type === 'file' && data[input.name]
    )

    let headers: Record<string, any> = {};
    if (hasFiles) {
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await axios.post('/execution', data, {headers});
      const answer: RunExecutionAnswer = response.data

      if (!answer.success) {
        throw new Error(answer.message);
      }
      if (!answer.executionId) {
        throw new Error('Execution ID is missing in the response');
      }
      onSucceed && onSucceed(answer.executionId);
      toast.success('Script execution started')
      // TODO: disable inputs when processing is true
    } catch (error) {
      // TODO: The server return 400 but with the error message saying what happend. But axios return its error because it is code 400. Try to not make axios panic.
      toast.error('error: ' + error.message);
      setProcessing(false);
    }
  }

  return (
    <div className="execution-form">
      <div className="card">
        <div className="card__body">
          <h3>Configuration</h3>
          <form onSubmit={handleSubmit}>
            {project_infos.inputs.map(input => {
              if (input.type === 'file') {
                return <FileInput inputInfos={input} onChange={handleInputChange} key={input.name} />
              }
              if (input.type === 'text') {
                return <TextInput inputInfos={input} key={input.name} onChange={handleInputChange}/>
              }
              return <></>
            })}

            <button
              type="submit"
              disabled={processing}
              className="btn btn--primary btn--full-width"
            >
              {processing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin"/>
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2"/>
                  Run Script
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>



  )

}
