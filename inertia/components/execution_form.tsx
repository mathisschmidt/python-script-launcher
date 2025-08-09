import {useForm} from "@inertiajs/react";
import {ProjectInfos} from "~/types/schemas";
import {Loader, Play} from "lucide-react";
import FileInput from "~/components/ui/execution_inputs/file_input";
import TextInput from "~/components/ui/execution_inputs/text_input";

type ExecutionFormProps = {
  project_infos: ProjectInfos;
}

export default function ExecutionForm(props: ExecutionFormProps) {
  const { project_infos } = props;

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

  const { data, setData, post, processing, reset } = useForm(getInitialData())

  const handleInputChange = (key: string, value: any) => {
    setData(key, value)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    console.log("entered")
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

    post('/execution', {
      forceFormData: hasFiles, // Only use FormData if we have files
      onSuccess: () => {
        console.log('Form submitted successfully!')
        reset()
      }
    })
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
