const BASE = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  children?: Category[];
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE}/categories`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    // backend bisa return { data: [...] } atau langsung array
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    return [];
  },

  create: async (payload: {
    name: string;
    description?: string;
    parent_id?: string | null;
  }): Promise<Category> => {
    const res = await fetch(`${BASE}/categories`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw { status: res.status, message: json.message };
    return json.data;
  },

  update: async (
    id: string,
    payload: { name?: string; description?: string; parent_id?: string | null }
  ): Promise<Category> => {
    const res = await fetch(`${BASE}/categories/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw { status: res.status, message: json.message };
    return json.data;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE}/categories/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw { status: res.status, message: json.message };
  },
};