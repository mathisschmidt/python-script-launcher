import {Head, router} from '@inertiajs/react'
import {ProjectInfos} from '~/types/schemas'
import {Folder, FileCode, ArrowRightCircle} from 'lucide-react'
import Header from "~/components/common/header";

type ProbsDashboard = {
  projects: Array<ProjectInfos>;
}

export default function Dashboard(props: ProbsDashboard) {
  const {projects} = props;

  const handleProjectClick = (projectId: number) => {
    router.visit(`/execution/${projectId}`)
  }

  return (
    <>
      <Head title="Python Script Launcher"/>
      <Header
        activeLink={'Dashboard'}
      >
        <div className="page">
          <div className="page-header">
            <h2>Script Dashboard</h2>
            <p className="page-description">Select a Python project to run from your configured scripts.</p>
          </div>
          <div className="projects-grid" id="projects-grid">
            {
              projects.map((project: ProjectInfos) => (
                <div className="project-card" onClick={() => handleProjectClick(project.id)} key={project.id}>
                  <div className="project-header">
                    <h3 className="project-title">{project.name}</h3>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    <div className="meta-item">
                      <Folder className="w-4 h-4 mr-2"/>
                      <span>{project.path}</span>
                    </div>
                    <div className="meta-item">
                      <FileCode className="w-4 h-4 mr-2"/>
                      <span>{project.scriptName}</span>
                    </div>
                    <div className="meta-item">
                      <ArrowRightCircle className="w-4 h-4 mr-2"/>
                      <span>{project.inputs.length} input(s), {project.outputs.length} output(s)</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </Header>
    </>
)
}
