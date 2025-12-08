import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertToOpenAPI } from "../src/index.js";

// fs/promises 모듈을 모킹
vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
}));

// 모킹된 함수들을 import (모킹 후에 import해야 함)
import { readFile, writeFile } from "node:fs/promises";

describe("convertToOpenAPI with mocked fs", () => {
	beforeEach(() => {
		// 각 테스트 전에 mock 초기화
		vi.clearAllMocks();
	});

	it("should read input file and write OpenAPI spec", async () => {
		// Given: 입력 파일 내용 설정
		const mockInput = {
			info: {
				name: "Test API",
				description: "A test API",
			},
		};

		vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockInput));

		// When: 변환 실행
		await convertToOpenAPI("input.json", "output.json");

		// Then: readFile이 올바른 인자로 호출되었는지 확인
		expect(readFile).toHaveBeenCalledWith("input.json", "utf-8");
		expect(readFile).toHaveBeenCalledTimes(1);

		// Then: writeFile이 올바른 OpenAPI 스펙으로 호출되었는지 확인
		expect(writeFile).toHaveBeenCalledTimes(1);
		const [outputPath, content] = vi.mocked(writeFile).mock.calls[0];

		expect(outputPath).toBe("output.json");

		const writtenSpec = JSON.parse(content as string);
		expect(writtenSpec.openapi).toBe("3.0.0");
		expect(writtenSpec.info.title).toBe("Test API");
		expect(writtenSpec.info.description).toBe("A test API");
	});

	it("should handle missing info.name gracefully", async () => {
		// Given: name이 없는 입력
		const mockInput = {
			info: {
				description: "API without name",
			},
		};

		vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockInput));

		// When
		await convertToOpenAPI("input.json", "output.json");

		// Then: 기본값 "API"를 사용해야 함
		const [, content] = vi.mocked(writeFile).mock.calls[0];
		const writtenSpec = JSON.parse(content as string);

		expect(writtenSpec.info.title).toBe("API");
	});

	it("should propagate readFile errors", async () => {
		// Given: 파일 읽기 실패
		vi.mocked(readFile).mockRejectedValue(
			new Error("ENOENT: no such file or directory"),
		);

		// When/Then: 에러가 전파되어야 함
		await expect(
			convertToOpenAPI("missing.json", "output.json"),
		).rejects.toThrow("ENOENT");
	});

	it("should propagate writeFile errors", async () => {
		// Given: 읽기는 성공하지만 쓰기는 실패
		const mockInput = { info: { name: "Test" } };
		vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockInput));
		vi.mocked(writeFile).mockRejectedValue(
			new Error("EACCES: permission denied"),
		);

		// When/Then
		await expect(convertToOpenAPI("input.json", "output.json")).rejects.toThrow(
			"EACCES",
		);
	});
});
