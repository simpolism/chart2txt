
export function deepClone<T>(obj: T, hash = new WeakMap()): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj) as any;
  }

  if (hash.has(obj)) {
    return hash.get(obj);
  }

  const clonedObj: T = Array.isArray(obj)
    ? ([] as any)
    : (Object.create(Object.getPrototypeOf(obj)) as any);

  hash.set(obj, clonedObj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clonedObj as any)[key] = deepClone((obj as any)[key], hash);
    }
  }

  return clonedObj;
}
