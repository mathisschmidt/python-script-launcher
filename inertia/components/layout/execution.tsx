import { router } from "@inertiajs/react";
import {ArrowLeft, Download, File} from "lucide-react";
import {useState} from "react";
import { ProjectInfos } from "~/types/project_infos";
import ExecutionForm from "~/components/execution_form";


export default function Execution(project_infos: ProjectInfos) {

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.visit('/dashboard')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{project_infos.name}</h2>
        <p className="text-gray-600">{project_infos.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Configuration</h3>
          <ExecutionForm project_infos={project_infos}/>
        </div>

        {/* Output Terminal */}
        {/*<div className="bg-white rounded-lg shadow-md p-6">*/}
        {/*  <div className="flex items-center justify-between mb-4">*/}
        {/*    <h3 className="text-xl font-semibold">Output</h3>*/}
        {/*    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(executionStatus)}`}>*/}
        {/*            {executionStatus === 'ready' ? 'Ready' :*/}
        {/*              executionStatus === 'running' ? 'Running' :*/}
        {/*                executionStatus === 'completed' ? 'Completed' : executionStatus}*/}
        {/*          </span>*/}
        {/*  </div>*/}

        {/*  <div*/}
        {/*    ref={terminalRef}*/}
        {/*    className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm"*/}
        {/*  >*/}
        {/*    {terminalOutput.map((line, index) => (*/}
        {/*      <div key={index} className={`${getLogLineClass(line)} mb-1`}>*/}
        {/*        {line}*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*</div>*/}

        {/* Results Section */}
        {/*{executionResults && (*/}
        {/*  <div className="mt-6 bg-white rounded-lg shadow-md p-6">*/}
        {/*    <h3 className="text-xl font-semibold mb-4">Results</h3>*/}

        {/*    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">*/}
        {/*      <div className="bg-green-50 p-4 rounded-md">*/}
        {/*        <div className="text-sm text-gray-600">Status</div>*/}
        {/*        <div className="text-lg font-semibold text-green-600">Completed Successfully</div>*/}
        {/*      </div>*/}
        {/*      <div className="bg-blue-50 p-4 rounded-md">*/}
        {/*        <div className="text-sm text-gray-600">Duration</div>*/}
        {/*        <div className="text-lg font-semibold text-blue-600">{executionResults.duration.toFixed(1)}s</div>*/}
        {/*      </div>*/}
        {/*      <div className="bg-purple-50 p-4 rounded-md">*/}
        {/*        <div className="text-sm text-gray-600">Files Generated</div>*/}
        {/*        <div className="text-lg font-semibold text-purple-600">{executionResults.outputs?.length || 0}</div>*/}
        {/*      </div>*/}
        {/*    </div>*/}

        {/*    {executionResults.outputs && executionResults.outputs.length > 0 && (*/}
        {/*      <div>*/}
        {/*        <h4 className="text-lg font-semibold mb-3">Output Files</h4>*/}
        {/*        <div className="space-y-3">*/}
        {/*          {executionResults.outputs.map((file, index) => (*/}
        {/*            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">*/}
        {/*              <div className="flex items-center">*/}
        {/*                <File className="w-5 h-5 mr-3 text-gray-400" />*/}
        {/*                <div>*/}
        {/*                  <div className="font-medium">{file.name}</div>*/}
        {/*                  <div className="text-sm text-gray-500">{file.size}</div>*/}
        {/*                </div>*/}
        {/*              </div>*/}
        {/*              <button*/}
        {/*                onClick={() => downloadFile(file.name)}*/}
        {/*                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"*/}
        {/*              >*/}
        {/*                <Download className="w-4 h-4 mr-1" />*/}
        {/*                Download*/}
        {/*              </button>*/}
        {/*            </div>*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
}
