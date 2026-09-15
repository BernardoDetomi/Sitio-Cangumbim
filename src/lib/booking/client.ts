export async function api<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(path, { method: data === undefined ? 'GET' : 'POST', cache: 'no-store', ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir. Tente novamente.');
  return result;
}
