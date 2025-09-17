# nest-builder

🔨 A powerful CLI tool to forge NestJS modules with better folder organization and structure.

## Installation

```bash
npm install -g nest-builder
```

Or with yarn:
```bash
yarn global add nest-builder
```

## Quick Start

```bash
# Navigate to your NestJS project
cd my-nestjs-app

# Generate a complete resource
nest-builder resource users

# Or use the short alias
nb res users
```

## Usage

### Generate Complete Resource (Recommended)

```bash
nest-builder resource users
# or
nb res users
```

This creates a complete CRUD module with organized folder structure:

```
src/users/
├── users.module.ts
├── controllers/
│   ├── users.controller.ts
│   └── users.controller.spec.ts
├── services/
│   ├── users.service.ts
│   └── users.service.spec.ts
├── dtos/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
└── entities/
    └── user.entity.ts
```

### Generate Individual Components

```bash
# Generate only a controller
nest-builder controller users
nb co users

# Generate only a service
nest-builder service users
nb s users

# Generate only a module
nest-builder module users
nb mo users
```

### Interactive Mode

Not sure what you need? Let the CLI guide you:

```bash
nest-builder resource
# Will ask for:
# - Module name
# - Transport layer (REST, GraphQL, etc.)
# - CRUD endpoints (yes/no)
```

### Options

```bash
# Skip test files
nest-builder resource users --no-spec
nb res users --no-spec

# Generate empty controller/service (no CRUD)
nest-builder controller users --no-crud
nb service users --no-crud
```

## All Available Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `nest-builder resource [name]` | `nb res` | Generate complete module with all files |
| `nest-builder controller [name]` | `nb co` | Generate controller only |
| `nest-builder service [name]` | `nb s` | Generate service only |
| `nest-builder module [name]` | `nb mo` | Generate module only |
| `nest-builder g <type> [name]` | `nb g` | Generate using shorthand |

### Shorthand Generate Commands

```bash
# Using the 'g' (generate) command
nest-builder g res users      # resource
nest-builder g co users       # controller
nest-builder g s users        # service
nest-builder g mo users       # module
```

## Features

✨ **Better Organization** - Files organized in subfolders (controllers/, services/, dtos/, entities/)  
🚀 **Fast Generation** - No compilation needed, instant file creation  
🎯 **Flexible** - Generate complete resources or individual components  
📝 **TypeScript Ready** - All files are TypeScript with proper imports  
🧪 **Testing Support** - Generates spec files for testing (optional)  
🔧 **Interactive Mode** - CLI guides you through the options  
📦 **Auto Import** - Automatically updates app.module.ts  

## Examples

### 1. Generate a User Management Module
```bash
nest-builder resource users
# ✔ Creates complete CRUD structure
# ✔ Updates app.module.ts
```

### 2. Add Authentication Module
```bash
nest-builder resource auth --no-crud
# ✔ Creates module with empty controller/service
# ✔ Perfect for custom implementation
```

### 3. Generate Products with No Tests
```bash
nest-builder resource products --no-spec
# ✔ Skips .spec.ts files
# ✔ Faster for prototypes
```

### 4. Add a Controller to Existing Module
```bash
nest-builder controller orders
# ✔ Adds controller to existing orders module
# ✔ Module must exist first
```

## Comparison with NestJS CLI

| Feature | NestJS CLI | nest-builder |
|---------|------------|------------|
| Command | `nest g resource users` | `nest-builder resource users` |
| Folder Organization | Flat structure | Organized subfolders |
| Speed | Requires compilation | Instant |
| Interactive Mode | ✓ | ✓ |
| CRUD Generation | ✓ | ✓ |
| Custom Structure | ✗ | ✓ |

## Generated File Structure

### With nest-builder (Organized):
```
src/users/
├── users.module.ts
├── controllers/
│   └── users.controller.ts
├── services/
│   └── users.service.ts
├── dtos/
│   └── *.dto.ts
└── entities/
    └── *.entity.ts
```

### With NestJS CLI (Flat):
```
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   └── *.dto.ts
└── entities/
    └── *.entity.ts
```

## Requirements

- Node.js >= 14.0.0
- An existing NestJS project
- Run from the root of your NestJS project

## Installation & Setup Guide

```bash
# 1. Create your NestJS project (if you haven't)
nest new my-app
cd my-app

# 2. Install nest-builder globally
npm install -g nest-builder

# 3. Start generating modules!
nest-builder resource users
nest-builder resource products
nest-builder resource orders

# 4. Run your app
npm run start:dev
```

## Tips & Best Practices

1. **Start with resources**: Use `nest-builder resource` for new features
2. **Use singular names**: The CLI will pluralize when needed
3. **Follow NestJS conventions**: Use kebab-case for file names
4. **Generate tests**: Keep `--spec` enabled for production code
5. **Interactive mode for beginners**: Just run `nest-builder resource` without arguments

## Troubleshooting

### "Not in a NestJS project"
- Make sure you're in the root directory of your NestJS project
- Check that `package.json` contains `@nestjs/core`

### "Module already exists"
- The module folder already exists
- Use individual generators to add components

### "Cannot find app.module.ts"
- Ensure `src/app.module.ts` exists
- The tool expects standard NestJS structure

## Contributing

Found a bug or want a feature? Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Author

Built with ❤️ for NestJS developers who value their time and clean code architecture.

---

**Note**: This tool complements the official NestJS CLI. Use `nest` for project creation and `nest-builder` for better module generation.