import {ProjectInfos} from "../../inertia/types/schemas.js";
import app from "@adonisjs/core/services/app";



export default class ExecuteProject {
  private readonly executeId: string
  private readonly workspacePath: string;
  private readonly data: Record<string, any>;

  constructor(private projectInfos: ProjectInfos, private request: any) {
    this.data = this.request.body()

    this.projectInfos.inputs.forEach((input) => {
      if (input.required && !(input.name in this.data)) {
        throw new Error(`${input.name} is required but not provided in the data.`);
      }
    })

    this.executeId = projectInfos.name.replaceAll(' ', '-') + '_' + Date.now();
    this.workspacePath = `/workspace/${this.executeId}`;
  }

  public async execute() {
    await this.copyFilesToWorkspace()

    return 'oui'
  }

  private async copyFilesToWorkspace() {
    for (const input of this.projectInfos.inputs) {
      if (input.type === 'file') {
        if (input.multiple) {
          const files = this.request.files(input.name)
          for (const file of files) {
            if (!file.isValid) {
              throw new Error(`File ${file.clientName} is not valid.`);
            }
            await file.move(app.tmpPath(this.workspacePath))
          }
        } else {
          const file = this.request.file(input.name)
          if (!file.isValid) {
            throw new Error(`File ${input.name} is not valid.`);
          }
          await file.move(app.tmpPath(this.workspacePath));
        }

      }
    }
  }
}
