type MongoIdLike = { toHexString(): string };

function isMongoIdLike(value: unknown): value is MongoIdLike {
  return Boolean(
    value &&
    typeof value === "object" &&
    "toHexString" in value &&
    typeof (value as MongoIdLike).toHexString === "function"
  );
}

function toPlainValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (isMongoIdLike(value)) return value.toHexString();
  if (Array.isArray(value)) return value.map(toPlainValue);
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, toPlainValue(nested)])
  );
}

export function serializeMongoDocument<T>(document: T): T {
  return toPlainValue(document) as T;
}

export function serializeMongoDocuments<T>(documents: T[]): T[] {
  return documents.map(serializeMongoDocument);
}

export function withoutMongoId<T extends object>(document: T): Omit<T, "_id"> {
  const plain = { ...serializeMongoDocument(document) } as T & { _id?: unknown };
  delete plain._id;
  return plain;
}
