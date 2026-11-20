function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function rowSnapshot(path, row) {
  const value = row ? clone(row.data) : undefined;
  return {
    id: path.split('/').pop(),
    exists: !!row,
    data: () => value,
    metadata: { fromCache: false },
  };
}

function readField(value, field) {
  return field.split('.').reduce((result, part) => result == null ? undefined : result[part], value);
}

function matches(value, filters) {
  return filters.every(({ field, op, expected }) => {
    const actual = readField(value, field);
    if (op === '==' || op === '===') return actual === expected;
    if (op === '!=' || op === '!==') return actual !== expected;
    if (op === '>') return actual > expected;
    if (op === '>=') return actual >= expected;
    if (op === '<') return actual < expected;
    if (op === '<=') return actual <= expected;
    if (op === 'array-contains') return Array.isArray(actual) && actual.includes(expected);
    throw new Error(`Unsupported collection filter: ${op}`);
  });
}

function subscribe(client, next, onError, refresh) {
  let active = true;
  const update = async () => {
    try {
      const { data, error } = await refresh();
      if (error) throw error;
      if (active) next(data);
    } catch (error) {
      if (active) onError?.(error);
    }
  };

  const channel = client
    .channel(`app-data-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_data' }, update)
    .subscribe((status, error) => {
      if (active && status === 'SUBSCRIBED') {
        void update();
      } else if (active && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
        onError?.(error || new Error(`Supabase realtime subscription ${status.toLowerCase()}.`));
      }
    });

  void update();
  return () => {
    active = false;
    void client.removeChannel(channel);
  };
}

function mergeObjects(current, update) {
  const result = { ...current };
  for (const [key, value] of Object.entries(update)) {
    const old = result[key];
    result[key] = value && typeof value === 'object' && !Array.isArray(value) &&
      old && typeof old === 'object' && !Array.isArray(old)
      ? mergeObjects(old, value)
      : value;
  }
  return result;
}

export function createSupabaseDb(client) {
  const doc = (path) => ({
    id: path.split('/').pop(),
    path,
    async get() {
      const { data, error } = await client.from('app_data').select('path,data').eq('path', path).maybeSingle();
      if (error) throw error;
      return rowSnapshot(path, data);
    },
    async set(value) {
      const { error } = await client.from('app_data').upsert({ path, data: clone(value) }, { onConflict: 'path' });
      if (error) throw error;
    },
    async update(value) {
      const current = await doc(path).get();
      const merged = mergeObjects(current.exists ? current.data() : {}, clone(value));
      await doc(path).set(merged);
    },
    async delete() {
      const { error } = await client.from('app_data').delete().eq('path', path);
      if (error) throw error;
    },
    onSnapshot(next, onError) {
      return subscribe(client, next, onError, async () => {
        const { data, error } = await client.from('app_data').select('path,data').eq('path', path).maybeSingle();
        return { data: rowSnapshot(path, data), error };
      });
    },
  });

  const collection = (path, query = {}) => {
    const api = {
      path,
      where(field, op, expected) {
        const actualOp = expected === undefined ? '==' : op;
        const actualExpected = expected === undefined ? op : expected;
        return collection(path, { ...query, filters: [...(query.filters || []), { field, op: actualOp, expected: actualExpected }] });
      },
      orderBy(field, direction = 'asc') {
        return collection(path, { ...query, orderField: field, direction });
      },
      limit(count) {
        return collection(path, { ...query, count });
      },
      doc(id) {
        const key = id || crypto.randomUUID().replace(/-/g, '');
        return doc(`${path}/${key}`);
      },
      async add(value) {
        const reference = api.doc();
        await reference.set(value);
        return reference;
      },
      onSnapshot(next, onError) {
        return subscribe(client, next, onError, async () => {
          const prefix = `${path}/`;
          const { data, error } = await client.from('app_data').select('path,data').like('path', `${prefix}%`);
          if (error) return { data: null, error };
          let rows = (data || []).filter((row) => row.path.startsWith(prefix) && !row.path.slice(prefix.length).includes('/'));
          rows = rows.filter((row) => matches(row.data, query.filters || []));
          if (query.orderField) {
            const sign = query.direction === 'desc' ? -1 : 1;
            rows.sort((a, b) => {
              const x = readField(a.data, query.orderField);
              const y = readField(b.data, query.orderField);
              return (x > y ? 1 : x < y ? -1 : 0) * sign;
            });
          }
          if (query.count !== undefined) rows = rows.slice(0, query.count);
          const docs = rows.map((row) => ({
            id: row.path.split('/').pop(),
            exists: true,
            data: () => clone(row.data),
            metadata: { fromCache: false },
          }));
          return { data: { docs, size: docs.length, empty: docs.length === 0 }, error: null };
        });
      },
    };
    return api;
  };

  return { doc, collection };
}
