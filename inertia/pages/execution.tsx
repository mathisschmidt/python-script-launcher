import {Head, router} from '@inertiajs/react'
import { ProjectInfos } from '~/types/schemas'
import Header from "~/components/common/header";
import ExecutionForm from "~/components/execution_form";
import {ArrowLeft} from "lucide-react";
import {useState} from "react";
import ExecutionOutput from "~/components/ui/execution_output";

type ProbsExecutionPage = {
  projectInfos: ProjectInfos
}

export default function ExecutionPage(props: ProbsExecutionPage) {
  const { projectInfos } = props
  const [executionId, setExecutionId] = useState<string | null>(null);

  const handleOnSucceed = (executionId: string) => {
    setExecutionId(executionId);
  }

  return (
    <>
      <Head title={`Execute ${projectInfos.name}`} />
      <Header
        activeLink={'Dashboard'}
      >
        <div className="page">
          <div className="execution-header">
            <button
              onClick={() => router.visit('/')}
              className="btn btn--outline back-btn"
              id="back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <div className="execution-title">
              <h2 id="project-name">Project Name</h2>
              <p id="project-description">Project description</p>
            </div>
          </div>
          <div className="execution-content">
            <ExecutionForm project_infos={projectInfos} onSucceed={handleOnSucceed}/>
            <ExecutionOutput projectInfos={projectInfos} executionId={executionId} />
          </div>
        </div>

      </Header>
    </>
  )
}
