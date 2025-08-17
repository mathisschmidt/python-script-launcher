import {Head, useForm} from "@inertiajs/react";
import Header from "~/components/common/header";
import {useRef, ChangeEvent} from "react";
import {toast} from "react-toastify";
import {CheckCircle, FileText, UploadCloud} from "lucide-react";
import axios from "axios";

type PropsConfiguration = {
  currentYamlConfig?: string
}

export default function Configuration(props: PropsConfiguration) {
  const {currentYamlConfig} = props
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { data, setData } = useForm(currentYamlConfig? {'yaml': currentYamlConfig}: {'yaml': ''})

  const handleClick = () => {
    fileInputRef.current?.click();
  }

  const changeContentValue = (content: string) => {
    setData('yaml', content)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return
    }
    const file = event.target.files[0]
    if (
      file.type === "application/x-yaml" ||
      file.name.endsWith('.yml') ||
      file.name.endsWith('.yaml') ||
      file.type === 'text/plain'
    ) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (contentRef.current && e.target) {
          contentRef.current.value = e.target.result as string ?? ""
          changeContentValue(e.target.result as string ?? "")
          toast.success(`${file.name} has been loaded.`)
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Invalid File. Please upload a YAML file (.yml or .yaml)")
    }

  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const result = await axios.post('/configuration/loadConf', data)
      toast.success(`${result.data.message}`);
    } catch (error) {
      // TODO: get error message and print it
      toast.error(`Loading failed`)
    }
  }

  const handleSample = (e: any) => {
    e.preventDefault()
    setData('yaml', sample)
  }

  return (
    <>
      <Head title="Configuration" />
      <Header activeLink="Configuration">
        <div className="page">
          <div className="page-header">
            <h2>Configuration Management</h2>
            <p className="page-description">Upload and validate your YAML configuration file to define available Python
              projects.</p>
          </div>

          <div className="config-section">
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="card__body">
                <h3>Upload Configuration</h3>
                <div
                  className="upload-area"
                  id="yaml-upload"
                  onClick={handleClick}
                >
                  <div className="upload-content">
                    <UploadCloud/>
                    <h4>Drop your YAML file here</h4>
                    <p>or click to browse</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file-input"
                      accept=".yaml,.yml"
                      className="hidden"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Or paste YAML content:</label>
                  <textarea
                    ref={contentRef}
                    id="yaml-content"
                    className="form-control"
                    value={data['yaml']}
                    rows={10}
                    onChange={(e) => {changeContentValue(e.target.value)}}
                    placeholder="Paste your YAML configuration here..."
                  ></textarea>
                </div>

                <div className="btn-group">
                  <button className="btn btn--primary" id="validate-config" type="submit">
                    <CheckCircle />
                    Load Configuration
                  </button>
                  <button className="btn btn--secondary" id="load-sample" onClick={handleSample}>
                    <FileText/>
                    Example Sample
                  </button>
                </div>
              </div>
              </form>
            </div>

            {false && <div className="validation-results" id="validation-results"></div>}
          </div>
        </div>
      </Header>
    </>
  )

}

const sample = `projects:
  - name: Test Project
    description: just a test project
    inputs:
      - name: config_path
        description: Path to the configuration file for CSV generation
        required: true
        type: file
        multiple: false
    path: E:\\Gitlab\\easy_money
    scriptName: -m easy_money generate-csv
    outputs:
      - idfc.csv
      - credit_agricole.csv
`
