// frontend/src/lib/api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const fetcher = async <T>(url: string): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, { headers });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no pedido da API.');
  }
  return response.json() as Promise<T>;
};

export const postData = async <ResponseData, RequestData>(url: string, data: RequestData, method: 'POST' | 'PUT' = 'POST'): Promise<ResponseData> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    method,
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no pedido da API.');
  }
  return response.json() as Promise<ResponseData>;
};

export const uploadFile = async <ResponseData>(url: string, formData: FormData): Promise<ResponseData> => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || 'Ocorreu um erro no upload do ficheiro.');
  }
  return response.json() as Promise<ResponseData>;
};

// Interfaces de resposta e pedido para Login/Registro
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  token: string;
  name: string;
  role: string;
  email: string;
  _id: string;
}
export const login = (email: string, password: string): Promise<LoginResponse> => postData<LoginResponse, LoginRequest>('/api/auth/login', { email, password });

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}
interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}
export const register = (name: string, email: string, password: string, role: string): Promise<RegisterResponse> => postData<RegisterResponse, RegisterRequest>('/api/auth/register', { name, email, password, role });

// Adicione a interface para ExpenseReport (conforme seu modelo no backend)
interface ExpenseReport {
  _id: string;
  description: string;
  amount: number;
  submittedBy: string; // Isso deve ser o ID do User
  receiptUrl?: string; // Opcional
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'assinado';
  // Adicione outros campos conforme seu modelo ExpenseReport.js
}

interface SubmitExpenseResponse {
  message: string;
  report: ExpenseReport; // ALTERADO: Tipagem de 'report' para a interface ExpenseReport
}

// ALTERADO: A tipagem da função submitExpense
export const submitExpense = (formData: FormData): Promise<SubmitExpenseResponse> => uploadFile<SubmitExpenseResponse>('/api/expenses/submit', formData);