import { vi } from "vitest";

/**
 * 인메모리 파일 시스템을 생성하고 fs/promises를 모킹하는 헬퍼
 */
export function createMockFileSystem() {
	const files = new Map<string, string | Buffer>();

	const mockFs = {
		readFile: vi.fn(
			async (
				path: string,
				encoding?: BufferEncoding | { encoding?: BufferEncoding },
			) => {
				const content = files.get(path);

				if (content === undefined) {
					throw Object.assign(
						new Error(`ENOENT: no such file or directory, open '${path}'`),
						{ code: "ENOENT", path },
					);
				}

				// encoding이 객체로 전달된 경우 처리
				const enc =
					typeof encoding === "string" ? encoding : encoding?.encoding;

				if (enc === "utf-8" || enc === "utf8") {
					return content.toString();
				}

				return content;
			},
		),

		writeFile: vi.fn(async (path: string, content: string | Buffer) => {
			files.set(path, content);
		}),

		unlink: vi.fn(async (path: string) => {
			if (!files.has(path)) {
				throw Object.assign(
					new Error(`ENOENT: no such file or directory, unlink '${path}'`),
					{ code: "ENOENT", path },
				);
			}
			files.delete(path);
		}),

		access: vi.fn(async (path: string) => {
			if (!files.has(path)) {
				throw Object.assign(
					new Error(`ENOENT: no such file or directory, access '${path}'`),
					{ code: "ENOENT", path },
				);
			}
		}),

		mkdir: vi.fn(async (_path: string) => {
			// 간단한 구현: 실제로는 아무것도 하지 않음
			return undefined;
		}),

		readdir: vi.fn(async (path: string) => {
			// path로 시작하는 모든 파일 반환
			const entries: string[] = [];
			for (const [filePath] of files) {
				if (filePath.startsWith(path)) {
					const relative = filePath.slice(path.length).replace(/^\//, "");
					const firstPart = relative.split("/")[0];
					if (firstPart && !entries.includes(firstPart)) {
						entries.push(firstPart);
					}
				}
			}
			return entries;
		}),
	};

	return {
		fs: mockFs,
		// 파일 시스템 조작 헬퍼들
		addFile: (path: string, content: string | Buffer) => {
			files.set(path, content);
		},
		removeFile: (path: string) => {
			files.delete(path);
		},
		getFile: (path: string) => {
			return files.get(path);
		},
		hasFile: (path: string) => {
			return files.has(path);
		},
		clear: () => {
			files.clear();
		},
		getAllFiles: () => {
			return new Map(files);
		},
	};
}

/**
 * 특정 파일들로 초기화된 모킹된 파일 시스템 생성
 */
export function createMockFileSystemWithFiles(
	initialFiles: Record<string, string>,
) {
	const mockFs = createMockFileSystem();

	for (const [path, content] of Object.entries(initialFiles)) {
		mockFs.addFile(path, content);
	}

	return mockFs;
}
