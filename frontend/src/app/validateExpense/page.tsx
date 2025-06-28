// frontend/src/app/validateExpense/page.tsx
'use client'; // Terá interatividade para aprovação/rejeição

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Para pegar o ID da URL

interface ExpenseReportDetails {
  id: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: string;
  receiptUrl: string; // URL do recibo para visualização
  // Adicione outros campos
}

export default function ValidateExpensePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('id'); // Pega o ID do relatório da URL
  const [report, setReport] = useState<ExpenseReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState(''); // Comentário para rejeição/aprovação

  useEffect(() => {
    if (!reportId) {
      // Se não houver ID, redireciona ou mostra erro
      router.push('/pendingExpenses');
      return;
    }

    // TODO: Chamar API do backend para buscar detalhes do relatório pelo ID
    const fetchReportDetails = async () => {
      try {
        // Ex: const response = await fetch(`/api/expenses/${reportId}`);
        // const data = await response.json();
        // setReport(data);
        // Dados mock para exemplo:
        setReport({
          id: reportId,
          description: `Relatório de Exemplo para ID: ${reportId}`,
          amount: 250.00,
          status: 'pendente',
          submittedBy: 'Colaborador Teste',
          receiptUrl: '/placeholder-receipt.png', // Substitua por uma URL real do seu backend/storage
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes do relatório:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReportDetails();
  }, [reportId, router]);

  const handleValidation = async (status: 'aprovado' | 'rejeitado') => {
    if (!report) return;

    console.log(`Validando relatório ${report.id} como: ${status} com comentário: "${comment}"`);
    // TODO: Chamar API do backend para atualizar o status do relatório
    try {
      // Ex: await fetch(`/api/expenses/${report.id}/validate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status, comment }),
      // });
      alert(`Relatório ${report.id} ${status} com sucesso!`);
      router.push('/pendingExpenses'); // Redireciona de volta para a lista de pendentes
    } catch (error) {
      console.error(`Erro ao ${status} relatório:`, error);
      alert(`Falha ao ${status} relatório.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando detalhes do relatório...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500">
        <p>Relatório não encontrado ou erro ao carregar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Validar Relatório de Despesa</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="mb-2"><span className="font-semibold">ID:</span> {report.id}</p>
        <p className="mb-2"><span className="font-semibold">Descrição:</span> {report.description}</p>
        <p className="mb-2"><span className="font-semibold">Valor:</span> R$ {report.amount.toFixed(2)}</p>
        <p className="mb-2"><span className="font-semibold">Status:</span> {report.status}</p>
        <p className="mb-4"><span className="font-semibold">Enviado Por:</span> {report.submittedBy}</p>

        {report.receiptUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recibo:</h2>
            <img src={report.receiptUrl} alt="Recibo" className="max-w-full h-auto border rounded-lg shadow-sm" />
            {/* Ou um link para PDF se for o caso */}
            {/* <a href={report.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver Recibo (PDF)</a> */}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Comentário (opcional):
          </label>
          <textarea
            id="comment"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleValidation('rejeitado')}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Rejeitar
          </button>
          <button
            onClick={() => handleValidation('aprovado')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}
