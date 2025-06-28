// frontend/src/app/signedExpenses/page.tsx
'use client'; // Pode ter interatividade (ver detalhes da assinatura)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SignedReport {
  id: string;
  description: string;
  amount: number;
  signedBy: string; // Quem assinou (ex: Diretor)
  signatureStatus: 'válida' | 'inválida' | 'pendente_verificacao'; // Status da verificação
}

export default function SignedExpensesPage() {
  const [signedReports, setSignedReports] = useState<SignedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Chamar API do backend para listar relatórios assinados (para Diretor)
    const fetchSignedReports = async () => {
      try {
        // Ex: const response = await fetch('/api/expenses/signed');
        // const data = await response.json();
        // setSignedReports(data);
        // Dados mock para exemplo:
        setSignedReports([
          { id: 'sign001', description: 'Viagem de Negócios Q1', amount: 500.00, signedBy: 'Diretor Alfa', signatureStatus: 'pendente_verificacao' },
          { id: 'sign002', description: 'Marketing Digital Campanha', amount: 1200.00, signedBy: 'Diretor Beta', signatureStatus: 'pendente_verificacao' },
        ]);
      } catch (error) {
        console.error('Erro ao buscar relatórios assinados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSignedReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando relatórios assinados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Relatórios de Despesas Assinados</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {signedReports.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Nenhum relatório assinado encontrado.</p>
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
                  Assinado Por
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status Assinatura
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {signedReports.map((report) => (
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
                    {report.signedBy}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.signatureStatus === 'válida' ? 'bg-green-100 text-green-800' :
                      report.signatureStatus === 'inválida' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.signatureStatus}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-right">
                    <Link href={`/verifySignature?id=${report.id}`} className="text-blue-600 hover:text-blue-900">
                      Verificar
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
