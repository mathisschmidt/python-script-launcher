import {useEffect, useRef, useState} from "react";
import axios from "axios";
import {ExecutionMessage, ExecutionMessageSchema, ExecutionStatus, ExecutionStatusSchema} from "~/types/schemas";
import {toast} from "react-toastify";

type PropsExecutionOutput = {
  executionId: string
}

export default function ExecutionOutput(props: PropsExecutionOutput) {
  const {executionId} = props
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
  }, []);

  return (
    <div className="execution-output">
      <div className="card">
        <div className="card__body">
          <div className="output-header">
            <h3>Output</h3>
            <div className="status-indicator" id="execution-status">
              <span className="status status--info">Ready</span>
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
                <div id="execution-summary">To implement</div>
                <div id="output-files">{statusRef.current?.startedAt?.toISOString()}-{statusRef.current?.completedAt?.toISOString()} code:{statusRef.current?.exitCode}, status{statusRef.current?.status}</div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
