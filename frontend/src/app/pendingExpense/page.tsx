// frontend/src/app/pendingExpenses/page.tsx
'use client'; // Terá interatividade (aprovar/rejeitar)

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Usar Link para navegação Next.js

interface ExpenseReport {
  id: string;
  description: string;
  amount: number;
  status: string; // Ex: 'pendente', 'aprovado', 'rejeitado'
  submittedBy: string; // Nome do colaborador
  // Adicione outros campos necessários
}

export default function PendingExpensesPage() {
  const [pendingReports, setPendingReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Chamar API do backend para listar relatórios pendentes (para Gerente)
    const fetchPendingReports = async () => {
      try {
        // Ex: const response = await fetch('/api/expenses/pending');
        // const data = await response.json();
        // setPendingReports(data);
        // Dados mock para exemplo:
        setPendingReports([
          { id: 'exp001', description: 'Reunião com Cliente X', amount: 150.75, status: 'pendente', submittedBy: 'João Silva' },
          { id: 'exp002', description: 'Material de Escritório', amount: 89.90, status: 'pendente', submittedBy: 'Maria Souza' },
        ]);
      } catch (error) {
        console.error('Erro ao buscar relatórios pendentes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando relatórios pendentes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Relatórios de Despesas Pendentes</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {pendingReports.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Nenhum relatório pendente para validação.</p>
        ) : (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Enviado Por
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    {report.id}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    {report.description}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    R$ {report.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    {report.submittedBy}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                    <Link href={`/validateExpense?id=${report.id}`} className="text-blue-600 hover:text-blue-900">
                      Visualizar e Validar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
