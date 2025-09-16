# nestjs-module-gen

A simple CLI tool to quickly generate NestJS modules with all the boilerplate code you need.

## Installation

```bash
npm install -g nestjs-module-gen
```

## Usage

Generate a complete NestJS module with one command:

```bash
nmg generate users
```

This creates:
- Module file
- Controller 
- Service
- DTOs (create & update)
- Entity

### Options

Skip files you don't need:

```bash
nmg generate users --no-dto --no-entity
```

### Interactive Mode

Not sure what you need? Use interactive mode:

```bash
nmg generate
```

## What Gets Generated

```
src/users/
  ├── users.module.ts
  ├── users.controller.ts
  ├── users.service.ts
  ├── dto/
  │    ├── create-user.dto.ts
  │    └── update-user.dto.ts
  └── entities/
       └── user.entity.ts
```

## Why Use This?

- **Save time** - No more manually creating the same files
- **Consistent structure** - Same organization every time
- **Flexible** - Generate only what you need
- **NestJS best practices** - Follows standard conventions

## Requirements

- Node.js 14+
- NestJS project

## Contributing

Found a bug or want a feature? Open an issue or PR!

## License

MIT

---

*Built for NestJS developers who value their time.*