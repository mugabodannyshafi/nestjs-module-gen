#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

// Helper functions
function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toSingular(str) {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es')) return str.slice(0, -2);
  if (str.endsWith('s')) return str.slice(0, -1);
  return str;
}

// Template generators
const templates = {
  module: (name) => {
    const className = toPascalCase(name);
    const singular = toSingular(name);
    return `import { Module } from '@nestjs/common';
import { ${className}Service } from './services/${name}.service';
import { ${className}Controller } from './controllers/${name}.controller';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
})
export class ${className}Module {}
`;
  },

  controller: (name, includeCrud = true) => {
    const className = toPascalCase(name);
    const singular = toSingular(name);
    const singularClass = toPascalCase(singular);

    if (!includeCrud) {
      return `import { Controller } from '@nestjs/common';
import { ${className}Service } from '../services/${name}.service';

@Controller('${name}')
export class ${className}Controller {
  constructor(private readonly ${name}Service: ${className}Service) {}
}
`;
    }

    return `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ${className}Service } from '../services/${name}.service';
import { Create${singularClass}Dto } from '../dtos/create-${singular}.dto';
import { Update${singularClass}Dto } from '../dtos/update-${singular}.dto';

@Controller('${name}')
export class ${className}Controller {
  constructor(private readonly ${name}Service: ${className}Service) {}

  @Post()
  create(@Body() create${singularClass}Dto: Create${singularClass}Dto) {
    return this.${name}Service.create(create${singularClass}Dto);
  }

  @Get()
  findAll() {
    return this.${name}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${name}Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update${singularClass}Dto: Update${singularClass}Dto) {
    return this.${name}Service.update(+id, update${singularClass}Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${name}Service.remove(+id);
  }
}
`;
  },

  service: (name, includeCrud = true) => {
    const className = toPascalCase(name);
    const singular = toSingular(name);
    const singularClass = toPascalCase(singular);

    if (!includeCrud) {
      return `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {}
`;
    }

    return `import { Injectable } from '@nestjs/common';
import { Create${singularClass}Dto } from '../dtos/create-${singular}.dto';
import { Update${singularClass}Dto } from '../dtos/update-${singular}.dto';

@Injectable()
export class ${className}Service {
  create(create${singularClass}Dto: Create${singularClass}Dto) {
    return 'This action adds a new ${singular}';
  }

  findAll() {
    return \`This action returns all ${name}\`;
  }

  findOne(id: number) {
    return \`This action returns a #\${id} ${singular}\`;
  }

  update(id: number, update${singularClass}Dto: Update${singularClass}Dto) {
    return \`This action updates a #\${id} ${singular}\`;
  }

  remove(id: number) {
    return \`This action removes a #\${id} ${singular}\`;
  }
}
`;
  },

  createDto: (name) => {
    const singular = toSingular(name);
    const singularClass = toPascalCase(singular);
    return `export class Create${singularClass}Dto {}
`;
  },

  updateDto: (name) => {
    const singular = toSingular(name);
    const singularClass = toPascalCase(singular);
    return `import { PartialType } from '@nestjs/mapped-types';
import { Create${singularClass}Dto } from './create-${singular}.dto';

export class Update${singularClass}Dto extends PartialType(Create${singularClass}Dto) {}
`;
  },

  entity: (name) => {
    const singular = toSingular(name);
    const singularClass = toPascalCase(singular);
    return `export class ${singularClass} {}
`;
  },

  controllerSpec: (name) => {
    const className = toPascalCase(name);
    return `import { Test, TestingModule } from '@nestjs/testing';
import { ${className}Controller } from './${name}.controller';
import { ${className}Service } from '../services/${name}.service';

describe('${className}Controller', () => {
  let controller: ${className}Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${className}Controller],
      providers: [${className}Service],
    }).compile();

    controller = module.get<${className}Controller>(${className}Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
`;
  },

  serviceSpec: (name) => {
    const className = toPascalCase(name);
    return `import { Test, TestingModule } from '@nestjs/testing';
import { ${className}Service } from './${name}.service';

describe('${className}Service', () => {
  let service: ${className}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [${className}Service],
    }).compile();

    service = module.get<${className}Service>(${className}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
`;
  },
};

// Check if module exists
async function moduleExists(name) {
  const modulePath = path.join(process.cwd(), 'src', name);
  return fs.existsSync(modulePath);
}

// Generate controller only
async function generateController(name, options = {} as any) {
  const baseDir = path.join(process.cwd(), 'src', name);
  const controllersDir = path.join(baseDir, 'controllers');

  // Check if module exists
  if (!(await moduleExists(name))) {
    console.log(
      chalk.red(
        `Module "${name}" does not exist. Generate the resource first.`,
      ),
    );
    return false;
  }

  try {
    await fs.ensureDir(controllersDir);

    // Generate controller
    await fs.writeFile(
      path.join(controllersDir, `${name}.controller.ts`),
      templates.controller(name, options.crud !== false),
    );
    console.log(
      chalk.green(`CREATE`) + ` src/${name}/controllers/${name}.controller.ts`,
    );

    // Generate spec if not disabled
    if (options.spec !== false) {
      await fs.writeFile(
        path.join(controllersDir, `${name}.controller.spec.ts`),
        templates.controllerSpec(name),
      );
      console.log(
        chalk.green(`CREATE`) +
          ` src/${name}/controllers/${name}.controller.spec.ts`,
      );
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`Error generating controller: ${error.message}`));
    return false;
  }
}

// Generate service only
async function generateService(name, options = {} as any) {
  const baseDir = path.join(process.cwd(), 'src', name);
  const servicesDir = path.join(baseDir, 'services');

  // Check if module exists
  if (!(await moduleExists(name))) {
    console.log(
      chalk.red(
        `Module "${name}" does not exist. Generate the resource first.`,
      ),
    );
    return false;
  }

  try {
    await fs.ensureDir(servicesDir);

    // Generate service
    await fs.writeFile(
      path.join(servicesDir, `${name}.service.ts`),
      templates.service(name, options.crud !== false),
    );
    console.log(
      chalk.green(`CREATE`) + ` src/${name}/services/${name}.service.ts`,
    );

    // Generate spec if not disabled
    if (options.spec !== false) {
      await fs.writeFile(
        path.join(servicesDir, `${name}.service.spec.ts`),
        templates.serviceSpec(name),
      );
      console.log(
        chalk.green(`CREATE`) + ` src/${name}/services/${name}.service.spec.ts`,
      );
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`Error generating service: ${error.message}`));
    return false;
  }
}

// Generate module only
async function generateModule(name) {
  const baseDir = path.join(process.cwd(), 'src', name);

  try {
    await fs.ensureDir(baseDir);

    // Generate module
    await fs.writeFile(
      path.join(baseDir, `${name}.module.ts`),
      templates.module(name),
    );
    console.log(chalk.green(`CREATE`) + ` src/${name}/${name}.module.ts`);

    // Update app.module.ts
    await updateAppModule(name);

    return true;
  } catch (error) {
    console.error(chalk.red(`Error generating module: ${error.message}`));
    return false;
  }
}

// Generate complete resource with folder structure
async function generateResource(name, options) {
  const baseDir = path.join(process.cwd(), 'src', name);
  const singular = toSingular(name);

  // Define folder paths
  const folders = {
    controllers: path.join(baseDir, 'controllers'),
    services: path.join(baseDir, 'services'),
    dtos: path.join(baseDir, 'dtos'),
    entities: path.join(baseDir, 'entities'),
  };

  try {
    // Create all directories
    for (const folder of Object.values(folders)) {
      await fs.ensureDir(folder);
    }

    // Generate module at root
    await fs.writeFile(
      path.join(baseDir, `${name}.module.ts`),
      templates.module(name),
    );
    console.log(chalk.green(`CREATE`) + ` src/${name}/${name}.module.ts`);

    // Generate controller in controllers folder
    await fs.writeFile(
      path.join(folders.controllers, `${name}.controller.ts`),
      templates.controller(name, options.crud),
    );
    console.log(
      chalk.green(`CREATE`) + ` src/${name}/controllers/${name}.controller.ts`,
    );

    if (options.spec !== false) {
      await fs.writeFile(
        path.join(folders.controllers, `${name}.controller.spec.ts`),
        templates.controllerSpec(name),
      );
      console.log(
        chalk.green(`CREATE`) +
          ` src/${name}/controllers/${name}.controller.spec.ts`,
      );
    }

    // Generate service in services folder
    await fs.writeFile(
      path.join(folders.services, `${name}.service.ts`),
      templates.service(name, options.crud),
    );
    console.log(
      chalk.green(`CREATE`) + ` src/${name}/services/${name}.service.ts`,
    );

    if (options.spec !== false) {
      await fs.writeFile(
        path.join(folders.services, `${name}.service.spec.ts`),
        templates.serviceSpec(name),
      );
      console.log(
        chalk.green(`CREATE`) + ` src/${name}/services/${name}.service.spec.ts`,
      );
    }

    // Generate DTOs in dtos folder if CRUD is enabled
    if (options.crud) {
      await fs.writeFile(
        path.join(folders.dtos, `create-${singular}.dto.ts`),
        templates.createDto(name),
      );
      console.log(
        chalk.green(`CREATE`) + ` src/${name}/dtos/create-${singular}.dto.ts`,
      );

      await fs.writeFile(
        path.join(folders.dtos, `update-${singular}.dto.ts`),
        templates.updateDto(name),
      );
      console.log(
        chalk.green(`CREATE`) + ` src/${name}/dtos/update-${singular}.dto.ts`,
      );
    }

    // Generate entity in entities folder
    await fs.writeFile(
      path.join(folders.entities, `${singular}.entity.ts`),
      templates.entity(name),
    );
    console.log(
      chalk.green(`CREATE`) + ` src/${name}/entities/${singular}.entity.ts`,
    );

    // Update app.module.ts
    await updateAppModule(name);

    return true;
  } catch (error) {
    console.error(chalk.red(`Error generating files: ${error.message}`));
    return false;
  }
}

// Update app.module.ts
async function updateAppModule(moduleName) {
  const appModulePath = path.join(process.cwd(), 'src', 'app.module.ts');
  const className = toPascalCase(moduleName);

  try {
    if (!fs.existsSync(appModulePath)) {
      return false;
    }

    let content = await fs.readFile(appModulePath, 'utf-8');

    // Add import
    const importStatement = `import { ${className}Module } from './${moduleName}/${moduleName}.module';`;
    const lastImportIndex = content.lastIndexOf('import');
    const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;

    if (!content.includes(importStatement)) {
      content =
        content.slice(0, nextLineIndex) +
        importStatement +
        '\n' +
        content.slice(nextLineIndex);
    }

    // Add to imports array
    const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
    if (importsMatch && !content.includes(`${className}Module`)) {
      const importsContent = importsMatch[1];
      const updatedImports =
        importsContent.trimEnd() +
        (importsContent.trim().endsWith(',') ? '' : ',') +
        `\n    ${className}Module,`;
      content = content.replace(
        /imports:\s*\[([\s\S]*?)\]/,
        `imports: [${updatedImports}\n  ]`,
      );
    }

    await fs.writeFile(appModulePath, content);
    console.log(chalk.yellow(`UPDATE`) + ` src/app.module.ts`);
    return true;
  } catch (error) {
    return false;
  }
}

// CLI setup
program.name('nest-builder').description('NestJS Module Generator CLI').version('2.0.0');

// Resource command
program
  .command('resource [name]')
  .alias('res')
  .description('Generate a new resource with folder structure')
  .option('--no-spec', 'Skip spec files')
  .action(async (name, options) => {
    let moduleName = name;

    if (!name) {
      const { resourceName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'resourceName',
          message:
            '? What name would you like to use for this resource (plural, e.g., "users")?',
          validate: (input) =>
            input.trim() !== '' || 'Resource name is required',
        },
      ]);
      moduleName = resourceName.toLowerCase();
    }

    const { transport } = await inquirer.prompt([
      {
        type: 'list',
        name: 'transport',
        message: '? What transport layer do you use?',
        choices: [
          { name: 'REST API', value: 'rest' },
          { name: 'GraphQL (code first)', value: 'graphql-code' },
          { name: 'GraphQL (schema first)', value: 'graphql-schema' },
          { name: 'Microservice (non-HTTP)', value: 'microservice' },
          { name: 'WebSockets', value: 'ws' },
        ],
        default: 'rest',
      },
    ]);

    const { crud } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'crud',
        message: '? Would you like to generate CRUD entry points?',
        default: true,
      },
    ]);

    const success = await generateResource(moduleName, {
      crud,
      spec: options.spec,
      transport,
    });

    if (!success) {
      console.log(chalk.red('Failed to generate resource.'));
    }
  });

// Controller command
program
  .command('controller [name]')
  .alias('co')
  .description('Generate a controller')
  .option('--no-spec', 'Skip spec files')
  .option('--no-crud', 'Generate empty controller')
  .action(async (name, options) => {
    if (!name) {
      const { controllerName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'controllerName',
          message: '? What name would you like to use for the controller?',
          validate: (input) =>
            input.trim() !== '' || 'Controller name is required',
        },
      ]);
      name = controllerName.toLowerCase();
    }

    await generateController(name, options);
  });

// Service command
program
  .command('service [name]')
  .alias('s')
  .description('Generate a service')
  .option('--no-spec', 'Skip spec files')
  .option('--no-crud', 'Generate empty service')
  .action(async (name, options) => {
    if (!name) {
      const { serviceName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'serviceName',
          message: '? What name would you like to use for the service?',
          validate: (input) =>
            input.trim() !== '' || 'Service name is required',
        },
      ]);
      name = serviceName.toLowerCase();
    }

    await generateService(name, options);
  });

// Module command
program
  .command('module [name]')
  .alias('mo')
  .description('Generate a module')
  .action(async (name) => {
    if (!name) {
      const { moduleName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleName',
          message: '? What name would you like to use for the module?',
          validate: (input) => input.trim() !== '' || 'Module name is required',
        },
      ]);
      name = moduleName.toLowerCase();
    }

    await generateModule(name);
  });

// Main generate command with schematic support
program
  .command('g <schematic> [name]')
  .description('Generate files (resource|controller|service|module)')
  .option('--no-spec', 'Skip spec files')
  .option('--no-crud', 'Generate empty controller/service')
  .action(async (schematic, name, options) => {
    const schematicMap = {
      resource: 'resource',
      res: 'resource',
      controller: 'controller',
      co: 'controller',
      service: 'service',
      s: 'service',
      module: 'module',
      mo: 'module',
    };

    const selectedSchematic = schematicMap[schematic];

    if (!selectedSchematic) {
      console.log(chalk.red(`Unknown schematic "${schematic}"`));
      console.log(
        chalk.gray(
          'Available schematics: resource, controller, service, module',
        ),
      );
      return;
    }

    // Handle each schematic
    switch (selectedSchematic) {
      case 'resource':
        if (!name) {
          const { resourceName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'resourceName',
              message:
                '? What name would you like to use for this resource (plural, e.g., "users")?',
              validate: (input) =>
                input.trim() !== '' || 'Resource name is required',
            },
          ]);
          name = resourceName.toLowerCase();
        }

        const { transport } = await inquirer.prompt([
          {
            type: 'list',
            name: 'transport',
            message: '? What transport layer do you use?',
            choices: [
              { name: 'REST API', value: 'rest' },
              { name: 'GraphQL (code first)', value: 'graphql-code' },
              { name: 'GraphQL (schema first)', value: 'graphql-schema' },
              { name: 'Microservice (non-HTTP)', value: 'microservice' },
              { name: 'WebSockets', value: 'ws' },
            ],
            default: 'rest',
          },
        ]);

        const { crud } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'crud',
            message: '? Would you like to generate CRUD entry points?',
            default: true,
          },
        ]);

        await generateResource(name, { crud, spec: options.spec, transport });
        break;

      case 'controller':
        if (!name) {
          const { controllerName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'controllerName',
              message: '? What name would you like to use for the controller?',
              validate: (input) =>
                input.trim() !== '' || 'Controller name is required',
            },
          ]);
          name = controllerName.toLowerCase();
        }
        await generateController(name, options);
        break;

      case 'service':
        if (!name) {
          const { serviceName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'serviceName',
              message: '? What name would you like to use for the service?',
              validate: (input) =>
                input.trim() !== '' || 'Service name is required',
            },
          ]);
          name = serviceName.toLowerCase();
        }
        await generateService(name, options);
        break;

      case 'module':
        if (!name) {
          const { moduleName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'moduleName',
              message: '? What name would you like to use for the module?',
              validate: (input) =>
                input.trim() !== '' || 'Module name is required',
            },
          ]);
          name = moduleName.toLowerCase();
        }
        await generateModule(name);
        break;
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
