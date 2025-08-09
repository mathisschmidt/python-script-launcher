import {useForm} from "@inertiajs/react";
import {ProjectInfos} from "~/types/project_infos";
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
        initialData[input.name] = input.multiple ? [] : null
      }
      if (input.type === 'text') {
        initialData[input.name] = input.default_value || ''
      }
    })
    return initialData
  }

  const { data, setData, post, errors, processing, reset } = useForm(getInitialData())

  const handleInputChange = (key: string, value: any) => {
    setData(key, value)
  }

  const handleRemove = (name_input: string, index_file: number) => {
    data[name_input] = data[name_input].filter((_: any, i: number) => i !== index_file)
    setData(name_input, data[name_input])
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

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
    <form onSubmit={handleSubmit}>
      {project_infos.inputs.map(input => {
        if (input.type === 'file') {
          return <FileInput input_infos={input} on_change={handleInputChange} on_remove={handleRemove} />
        }
        if (input.type === 'text') {
          return <TextInput input_infos={input} />
        }
        return <></>
      })}

      <button
        type="submit"
        disabled={processing}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Script
          </>
        )}
      </button>
    </form>
  )

}
