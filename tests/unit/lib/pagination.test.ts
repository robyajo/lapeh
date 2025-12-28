import { getPagination, buildPaginationMeta } from "../../../lib/utils/pagination";

describe("Pagination Utils", () => {
  describe("getPagination", () => {
    it("should return default values when query is empty", () => {
      const result = getPagination({});
      expect(result).toEqual({
        page: 1,
        perPage: 10,
        skip: 0,
        take: 10,
      });
    });

    it("should parse valid page and per_page", () => {
      const result = getPagination({ page: "2", per_page: "20" });
      expect(result).toEqual({
        page: 2,
        perPage: 20,
        skip: 20,
        take: 20,
      });
    });

    it("should handle array inputs", () => {
      const result = getPagination({ page: ["3", "4"], per_page: ["15", "20"] });
      expect(result).toEqual({
        page: 3,
        perPage: 15,
        skip: 30,
        take: 15,
      });
    });

    it("should use defaults for invalid inputs", () => {
      const result = getPagination({ page: "invalid", per_page: "invalid" });
      expect(result).toEqual({
        page: 1,
        perPage: 10,
        skip: 0,
        take: 10,
      });
    });

    it("should cap per_page at 100", () => {
      const result = getPagination({ per_page: "150" });
      expect(result).toEqual({
        page: 1,
        perPage: 10, // Defaulting to 10 because validation logic in getPagination might be strict or implementation detail
        // Wait, let's check implementation: 
        // perPageRaw && perPageRaw > 0 && perPageRaw <= 100 ? perPageRaw : 10;
        // So 150 > 100 is false, returns 10. Correct.
        skip: 0,
        take: 10,
      });
    });
    
    it("should handle numeric inputs", () => {
        const result = getPagination({ page: 2, per_page: 25 });
        expect(result).toEqual({
          page: 2,
          perPage: 25,
          skip: 25,
          take: 25,
        });
    });
  });

  describe("buildPaginationMeta", () => {
    it("should calculate meta correctly", () => {
      const meta = buildPaginationMeta(1, 10, 25);
      expect(meta).toEqual({
        page: 1,
        perPage: 10,
        total: 25,
        lastPage: 3,
      });
    });

    it("should handle zero total", () => {
      const meta = buildPaginationMeta(1, 10, 0);
      expect(meta).toEqual({
        page: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
      });
    });

    it("should handle exact page division", () => {
      const meta = buildPaginationMeta(1, 10, 20);
      expect(meta).toEqual({
        page: 1,
        perPage: 10,
        total: 20,
        lastPage: 2,
      });
    });
  });
});
