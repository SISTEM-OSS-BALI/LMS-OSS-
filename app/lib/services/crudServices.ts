import Cookies from "js-cookie";

interface CrudOptions {
  method: string;
  endpoint: string;
  body?: object;
}

interface CrudService {
  get: (endpoint: string) => Promise<any>;
  post: (endpoint: string, data: object) => Promise<any>;
  put: (endpoint: string, data: object) => Promise<any>;
  patch: (endpoint: string, data: object) => Promise<any>;
  delete: (endpoint: string, id: number | string) => Promise<any>;
  request: (options: CrudOptions) => Promise<any>;
}

async function crudRequest(
  endpoint: string,
  method: string,
  body?: object
): Promise<any> {
  try {
    const token = Cookies.get("token") as string | undefined;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    };
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`Error ${method} data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`CRUD ${method} error:`, error);
    throw error as Error;
  }
}

export const crudService: CrudService = {
  get: (endpoint: string): Promise<any> => crudRequest(endpoint, "GET"),
  post: (endpoint: string, data: object): Promise<any> =>
    crudRequest(endpoint, "POST", data),
  put: (endpoint: string, data: object): Promise<any> =>
    crudRequest(endpoint, "PUT", data),
  patch: (endpoint: string, data: object): Promise<any> =>
    crudRequest(endpoint, "PATCH", data),
  delete: (endpoint: string, id: number | string): Promise<any> =>
    crudRequest(endpoint, "DELETE", { id }),
  request: (options: CrudOptions): Promise<any> =>
    crudRequest(options.endpoint, options.method, options.body),
};
