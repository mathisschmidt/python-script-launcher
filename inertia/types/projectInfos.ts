export interface FileInputInfos {
  type: 'file'
  name: string
  description: string
  required: boolean
  multiple: boolean
}

export interface TextInputInfos {
  type: 'text'
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

export interface ProjectInfos {
  id: string
  name: string
  description: string
  inputs: Array<FileInputInfos | TextInputInfos>
  path: string
  scriptName: string
  outputs: string[]
}
