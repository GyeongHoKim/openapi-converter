# Testing Guide

This project uses Vitest for testing with comprehensive mocking strategies for `fs/promises`.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

## File System Mocking Patterns

### Pattern 1: Direct Mock with vi.mock()

Best for: Simple tests where you need full control over fs behavior.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the entire fs/promises module
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";

describe("My Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mock readFile", async () => {
    // Setup mock behavior
    vi.mocked(readFile).mockResolvedValue('{"test": "data"}');

    // Test your code
    const result = await readFile("test.json", "utf-8");

    // Assertions
    expect(result).toBe('{"test": "data"}');
    expect(readFile).toHaveBeenCalledWith("test.json", "utf-8");
  });
});
```

### Pattern 2: In-Memory File System (Recommended)

Best for: Integration tests that need realistic file system behavior.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockFileSystemWithFiles } from "./helpers/mock-fs.js";

vi.mock("node:fs/promises");

describe("My Test", () => {
  let mockFs: ReturnType<typeof createMockFileSystemWithFiles>;

  beforeEach(async () => {
    // Initialize with files
    mockFs = createMockFileSystemWithFiles({
      "input.json": JSON.stringify({ data: "test" }),
    });

    // Replace fs/promises with mock
    const fs = await import("node:fs/promises");
    Object.assign(fs, mockFs.fs);
  });

  it("should read and write files", async () => {
    const { readFile, writeFile } = await import("node:fs/promises");

    // Read existing file
    const content = await readFile("input.json", "utf-8");
    expect(JSON.parse(content).data).toBe("test");

    // Write new file
    await writeFile("output.json", '{"new": "data"}');

    // Verify file exists in memory
    expect(mockFs.hasFile("output.json")).toBe(true);
    const output = mockFs.getFile("output.json");
    expect(JSON.parse(output as string).new).toBe("data");
  });
});
```

## Mock File System Helper API

The `createMockFileSystem()` helper provides:

### Methods

- `fs` - Mocked fs/promises implementation
  - `readFile(path, encoding)` - Read file content
  - `writeFile(path, content)` - Write file content
  - `unlink(path)` - Delete file
  - `access(path)` - Check file exists
  - `mkdir(path)` - Create directory
  - `readdir(path)` - List directory contents

### Helper Methods

- `addFile(path, content)` - Add file to mock filesystem
- `removeFile(path)` - Remove file from mock filesystem
- `getFile(path)` - Get file content
- `hasFile(path)` - Check if file exists
- `clear()` - Clear all files
- `getAllFiles()` - Get all files as Map

### Example Usage

```typescript
const mockFs = createMockFileSystemWithFiles({
  "package.json": '{"name": "test"}',
  "src/index.ts": "export const foo = 'bar';",
});

// Add files dynamically
mockFs.addFile("test.txt", "hello world");

// Check existence
if (mockFs.hasFile("test.txt")) {
  const content = mockFs.getFile("test.txt");
  console.log(content); // "hello world"
}

// Remove files
mockFs.removeFile("test.txt");

// Clear all
mockFs.clear();
```

## Testing Error Scenarios

```typescript
it("should handle file not found", async () => {
  vi.mocked(readFile).mockRejectedValue(
    new Error("ENOENT: no such file or directory")
  );

  await expect(myFunction()).rejects.toThrow("ENOENT");
});

it("should handle permission denied", async () => {
  vi.mocked(writeFile).mockRejectedValue(
    new Error("EACCES: permission denied")
  );

  await expect(myFunction()).rejects.toThrow("EACCES");
});
```

## Verifying Function Calls

```typescript
it("should verify fs calls", async () => {
  await myFunction("input.json", "output.json");

  // Check if called with correct arguments
  expect(readFile).toHaveBeenCalledWith("input.json", "utf-8");

  // Check call count
  expect(writeFile).toHaveBeenCalledTimes(1);

  // Inspect call arguments
  const [path, content] = vi.mocked(writeFile).mock.calls[0];
  expect(path).toBe("output.json");
  expect(JSON.parse(content as string)).toMatchObject({
    openapi: "3.0.0",
  });
});
```

## Best Practices

1. **Use `beforeEach` to reset mocks** - Prevents test pollution
2. **Use the in-memory filesystem for integration tests** - More realistic
3. **Use direct mocks for unit tests** - Faster and more focused
4. **Always verify both success and error paths** - Comprehensive coverage
5. **Use meaningful test data** - Makes tests easier to understand

## Examples

See the following test files for complete examples:

- `test/index.test.ts` - Original tests with real files
- `test/index-with-mock.test.ts` - Direct mocking pattern
- `test/index-with-helper.test.ts` - In-memory filesystem pattern
