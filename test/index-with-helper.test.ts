import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertToOpenAPI } from "../src/index.js";
import { createMockFileSystemWithFiles } from "./helpers/mock-fs.js";

// fs/promises 모듈 모킹
vi.mock("node:fs/promises");

describe("convertToOpenAPI with mock-fs helper", () => {
	let mockFs: ReturnType<typeof createMockFileSystemWithFiles>;

	beforeEach(async () => {
		// 테스트용 초기 파일들 설정
		mockFs = createMockFileSystemWithFiles({
			"postman-collection.json": JSON.stringify({
				info: {
					name: "My Postman API",
					description: "A collection from Postman",
				},
			}),
			"apidog-collection.json": JSON.stringify({
				info: {
					name: "Apidog API",
					description: "A collection from Apidog",
				},
			}),
		});

		// fs/promises를 모킹된 버전으로 교체
		const fs = await import("node:fs/promises");
		Object.assign(fs, mockFs.fs);
	});

	it("should convert Postman collection", async () => {
		// When
		await convertToOpenAPI("postman-collection.json", "openapi-postman.json");

		// Then
		expect(mockFs.hasFile("openapi-postman.json")).toBe(true);

		const output = mockFs.getFile("openapi-postman.json");
		const spec = JSON.parse(output as string);

		expect(spec.openapi).toBe("3.0.0");
		expect(spec.info.title).toBe("My Postman API");
		expect(spec.info.description).toBe("A collection from Postman");
	});

	it("should convert Apidog collection", async () => {
		// When
		await convertToOpenAPI("apidog-collection.json", "openapi-apidog.json");

		// Then
		expect(mockFs.hasFile("openapi-apidog.json")).toBe(true);

		const output = mockFs.getFile("openapi-apidog.json");
		const spec = JSON.parse(output as string);

		expect(spec.openapi).toBe("3.0.0");
		expect(spec.info.title).toBe("Apidog API");
	});

	it("should handle file not found error", async () => {
		// When/Then
		await expect(
			convertToOpenAPI("non-existent.json", "output.json"),
		).rejects.toThrow("ENOENT");

		// 출력 파일도 생성되지 않아야 함
		expect(mockFs.hasFile("output.json")).toBe(false);
	});

	it("should overwrite existing output file", async () => {
		// Given: 기존 출력 파일이 있음
		mockFs.addFile("existing-output.json", "old content");

		// When
		await convertToOpenAPI("postman-collection.json", "existing-output.json");

		// Then: 파일이 새 내용으로 덮어써짐
		const output = mockFs.getFile("existing-output.json");
		expect(output).not.toBe("old content");

		const spec = JSON.parse(output as string);
		expect(spec.openapi).toBe("3.0.0");
	});

	it("should handle multiple conversions", async () => {
		// When: 여러 파일을 순차적으로 변환
		await convertToOpenAPI("postman-collection.json", "out1.json");
		await convertToOpenAPI("apidog-collection.json", "out2.json");

		// Then: 두 파일 모두 생성됨
		expect(mockFs.hasFile("out1.json")).toBe(true);
		expect(mockFs.hasFile("out2.json")).toBe(true);

		// 각 파일의 내용이 올바름
		const spec1 = JSON.parse(mockFs.getFile("out1.json") as string);
		const spec2 = JSON.parse(mockFs.getFile("out2.json") as string);

		expect(spec1.info.title).toBe("My Postman API");
		expect(spec2.info.title).toBe("Apidog API");
	});

	it("should verify fs function calls", async () => {
		// When
		await convertToOpenAPI("postman-collection.json", "output.json");

		// Then: fs 함수들이 올바르게 호출되었는지 확인
		expect(mockFs.fs.readFile).toHaveBeenCalledWith(
			"postman-collection.json",
			"utf-8",
		);
		expect(mockFs.fs.writeFile).toHaveBeenCalledTimes(1);

		// writeFile의 첫 번째 인자가 올바른 경로인지 확인
		const writeCall = vi.mocked(mockFs.fs.writeFile).mock.calls[0];
		expect(writeCall[0]).toBe("output.json");
	});
});
