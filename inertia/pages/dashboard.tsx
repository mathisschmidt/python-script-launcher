import { Head } from '@inertiajs/react'
import { ProjectInfos } from '~/types/schemas'
import { Folder, FileCode, ArrowRightCircle } from 'lucide-react'

type ProbsDashboard = {
  projects: Array<ProjectInfos>;
}

export default function Dashboard(props: ProbsDashboard) {
  const { projects } = props;
  return (
    <>
      <Head title="Python Script Launcher"/>
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">
              <span className="app-icon">🐍</span>
              Python Script Launcher
            </h1>
            <nav className="nav">
              <button className="nav-btn">Configuration</button>
              <button className="nav-btn active">Dashboard</button>
              <button className="nav-btn">History</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="page">
            <div className="page-header">
              <h2>Script Dashboard</h2>
              <p className="page-description">Select a Python project to run from your configured scripts.</p>
            </div>

            <div className="projects-grid" id="projects-grid">
              {
                projects.map((project: ProjectInfos) => (
                  <div className="project-card" onClick={() => console.log(project)} key={project.id}>
                    <div className="project-header">
                      <h3 className="project-title">{project.name}</h3>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="project-meta">
                      <div className="meta-item">
                        <Folder className="w-4 h-4 mr-2" />
                        <span>{project.path}</span>
                      </div>
                      <div className="meta-item">
                        <FileCode className="w-4 h-4 mr-2" />
                        <span>{project.scriptName}</span>
                      </div>
                      <div className="meta-item">
                        <ArrowRightCircle className="w-4 h-4 mr-2" />
                        <span>{project.inputs.length} input(s), {project.outputs.length} output(s)</span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
