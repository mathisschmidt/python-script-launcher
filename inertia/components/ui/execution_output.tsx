import {useEffect, useRef, useState} from "react";
import axios from "axios";
import {
  ExecutionMessage,
  ExecutionMessageSchema,
  ExecutionStatus,
  ExecutionStatusSchema,
  ProjectInfos
} from "~/types/schemas";
import {toast} from "react-toastify";
import clsx from "clsx";
import {Download, File} from "lucide-react";

type PropsExecutionOutput = {
  projectInfos: ProjectInfos
  executionId?: string | null
}

export default function ExecutionOutput(props: PropsExecutionOutput) {
  const {executionId, projectInfos} = props
  const [messages, setMessages] = useState<string[]>([]);
  const lastTimestamp = useRef<Date|null>(null)
  const statusRef = useRef<ExecutionStatus | null>(null)
  const intervalRef = useRef<NodeJS.Timeout|null>(null);

  const handleGetMessage = async () => {
    try {
      let url = `/execution_message/${executionId}`
      if (lastTimestamp.current) {
        url = `/execution_message/${executionId}?startTime=${lastTimestamp.current.toISOString()}`
      }
      console.debug(`Get messages: ${url}`)
      const response = await axios.get(url);
      const data: ExecutionMessage[] = response.data.map((dataMsg: any) => {
        return ExecutionMessageSchema.parse(dataMsg)
      });
      console.debug(`Received message: `, data);
      if (data.length > 0) {
        const newMessages = data.map(message => message.content);
        setMessages(prev => [...prev, ...newMessages]);
        console.debug(`timestamp: ${data[data.length - 1].timestamp}`)
        lastTimestamp.current = data[data.length - 1].timestamp
      }
    } catch (error) {
      console.error("Error fetching execution messages:", error)
      stopRequestLoop()
      toast.error('Error fetching messages: ' + error.message);
    }
  }

  const handleGetStatus = async () => {
    try {
      console.debug(`Get status`)
      const response = await axios.get(`/execution/status/${executionId}`)
      const status: ExecutionStatus = ExecutionStatusSchema.parse(response.data)
      console.log('Status received:', status)
      statusRef.current = status;
      if (isExecutionFinished()) {
        stopRequestLoop();
      }
    } catch (error) {
      console.error("Error fetching execution status:", error)
      stopRequestLoop()
      toast.error('Error fetching execution status: ' + error.message);
    }

  }

  const startRequestLoop = () => {
    if (!executionId) {
      return
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      console.log(`Isexecution is finish: ${isExecutionFinished()}`)
      if (!isExecutionFinished()) {
        handleGetStatus();
        handleGetMessage();
      } else {
        stopRequestLoop()
      }
    }, 1000);
  }

  const stopRequestLoop = () => {
    if (intervalRef.current) {
      console.debug('Stopping request loop')
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const isExecutionFinished = (): boolean => {
    if (statusRef.current) {
      return (statusRef.current.status !== 'pending' && statusRef.current.status !== 'running')
    }
    return false
  }

  useEffect(() => {
    startRequestLoop();

    return () => {
      stopRequestLoop()
    }
  }, [props]);

  const statusIsInfo = statusRef.current && (statusRef.current.status === 'running' || statusRef.current.status === 'pending')

  const statusIsError = statusRef.current && statusRef.current.status === 'failed'

  const statusIsSuccess = statusRef.current && statusRef.current.status === 'completed'

  const statusIsWarning = statusRef.current && statusRef.current.status === 'stopped'

  const handleDownload = async (output: string) => {
    if (!executionId) {
      toast.error('executionId is not set.')
      return
    }

    const response = await fetch(`/execution/${executionId}/${output}`, {
      method: "GET",
      credentials: "include"
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = output;
    link.click();

    // cleanup
    window.URL.revokeObjectURL(url);
    toast.success('Download successfully');
  };

  const getTotalTime = () => {
    if (!statusRef.current) {
      return -1
    }
    if (!statusRef.current.startedAt || !statusRef.current.completedAt) {
      return -1
    }
    const diffMs = statusRef.current.completedAt.getTime() - statusRef.current.startedAt.getTime(); // difference in milliseconds

    return Math.floor(diffMs / 1000)
  }

  return (
    <div className="execution-output">
      <div className="card">
        <div className="card__body">
          <div className="output-header">
            <h3>Output</h3>
            <div className="status-indicator">
              <span className={clsx(
                "status",
                statusIsInfo && "status--info",
                statusIsError && "status--error",
                statusIsSuccess && "status--success",
                statusIsWarning && "status--warning",
              )}>{statusRef.current? statusRef.current.status: 'Not running'}</span>
            </div>
          </div>
          <div className="terminal" id="terminal">
            <div className="terminal-content" id="terminal-content">
              {messages.length === 0?
                <div className="terminal-prompt">$ Ready to execute script...</div>:
                messages.map((message, index) => (
                  <div key={index} className='terminal-line terminal-prompt'>{message}</div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {
        isExecutionFinished() && (
          <div className="results-section">
            <div className="card">
              <div className="card__body">
                <h3>Results</h3>
                <div>
                  <div className={clsx(
                    "execution-summary",
                    statusIsError && "error",
                  )}>
                    <div className="summary-item">
                      <span>Duration:</span>
                      <span>{getTotalTime()}s</span>
                    </div>
                    <div className="summary-item">
                      <span>Files Generated:</span>
                      <span>Not implemented yet</span>
                    </div>
                  </div>
                </div>
                <div id="output-files">
                  {projectInfos.outputs.map(output => (
                    <div className="file-download">
                      <div className="file-info">
                        <File/>
                        <div className="file-details">
                          <span className="file-name">{output}</span>
                        </div>
                      </div>
                      <button className="download-btn" onClick={() => handleDownload(output)}>
                        <Download/>
                        Download
                      </button>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
