import fastJson from "fast-json-stringify";

// Cache untuk menyimpan fungsi stringify yang sudah dicompile
// Key: Nama schema/Identifier, Value: Fungsi stringify
const serializerCache = new Map<string, (doc: any) => string>();

/**
 * Membuat atau mengambil serializer yang sudah dicompile.
 *
 * @param key Identifier unik untuk schema (misal: 'UserResponse', 'ProductList')
 * @param schema JSON Schema definition (Standard JSON Schema)
 * @returns Fungsi yang mengubah object menjadi JSON string dengan sangat cepat
 */
export function getSerializer(key: string, schema: any) {
  if (serializerCache.has(key)) {
    return serializerCache.get(key)!;
  }

  const stringify = fastJson(schema);
  serializerCache.set(key, stringify);
  return stringify;
}

/**
 * Helper untuk mendefinisikan schema standar response Lapeh
 * { status: "success", message: string, data: T }
 */
export function createResponseSchema(dataSchema: any) {
  return {
    title: "StandardResponse",
    type: "object",
    properties: {
      status: { type: "string" },
      message: { type: "string" },
      data: dataSchema,
    },
  };
}

/**
 * Helper khusus untuk response paginasi
 * { status: "success", message: string, data: { data: T[], meta: ... } }
 */
export function createPaginatedResponseSchema(itemSchema: any) {
  return createResponseSchema({
    type: "object",
    properties: {
      data: {
        type: "array",
        items: itemSchema,
      },
      meta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          perPage: { type: "integer" },
          total: { type: "integer" },
          lastPage: { type: "integer" },
        },
      },
    },
  });
}
