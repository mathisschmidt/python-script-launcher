import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ProjectInfo from "#models/project";

export default class extends BaseSeeder {
  public async run() {

    // Create multiple projects
    const projects = [
      {
        name: 'Image Processing Tool',
        description: 'Advanced image processing and analysis tool',
        path: '/scripts/image-processor',
        script_name: 'process_image.py',
        inputs: [
          {
            name: 'source_image',
            description: 'Source image file to process',
            required: true,
            type: 'file' as const,
            multiple: false,
          },
          {
            name: 'output_format',
            description: 'Desired output format',
            required: false,
            type: 'text' as const,
            defaultValue: 'jpg',
          }
        ],
        outputs: ['processed_image.jpg', 'metadata.json']
      },
      {
        name: 'Data Analysis Script',
        description: 'Statistical analysis of CSV data',
        path: '/scripts/data-analyzer',
        script_name: 'analyze_data.py',
        inputs: [
          {
            name: 'data_files',
            description: 'CSV files for analysis',
            required: true,
            type: 'file' as const,
            multiple: true,
          },
          {
            name: 'analysis_type',
            description: 'Type of analysis to perform',
            required: true,
            type: 'text' as const,
            defaultValue: 'descriptive',
          },
          {
            name: 'confidence_level',
            description: 'Statistical confidence level',
            required: false,
            type: 'text' as const,
            defaultValue: '0.95',
          }
        ],
        outputs: ['analysis_report.pdf', 'summary_stats.json', 'charts.zip']
      },
      {
        name: 'Text Processing Pipeline',
        description: 'Natural language processing and text analysis',
        path: '/scripts/text-processor',
        script_name: 'process_text.py',
        inputs: [
          {
            name: 'input_text',
            description: 'Text content to process',
            required: true,
            type: 'text' as const,
          },
          {
            name: 'language',
            description: 'Language code for processing',
            required: false,
            type: 'text' as const,
            defaultValue: 'en',
          },
          {
            name: 'additional_dictionaries',
            description: 'Custom dictionary files',
            required: false,
            type: 'file' as const,
            multiple: true,
          }
        ],
        outputs: ['processed_text.txt', 'sentiment_analysis.json', 'keywords.json']
      }
    ]

    // Bulk create
    await ProjectInfo.createMany(projects)

    console.log(`Created ${projects.length} project records`)
  }
}
