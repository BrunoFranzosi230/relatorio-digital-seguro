// frontend/src/app/validateExpense/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Importe Suspense
import { useSearchParams, useRouter } from 'next/navigation';

interface ExpenseReportDetails {
  id: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: string;
  receiptUrl: string;
  // Adicione outros campos
}

// Componente Wrapper para usar useSearchParams
function ValidateExpenseContent() { // Renomeado o componente principal
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('id'); // Pega o ID do relatório da URL
  const [report, setReport] = useState<ExpenseReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState(''); // Comentário para rejeição/aprovação

  useEffect(() => {
    if (!reportId) {
      router.push('/pendingExpenses');
      return;
    }

    const fetchReportDetails = async () => {
      try {
        setReport({
          id: reportId,
          description: `Relatório de Exemplo para ID: ${reportId}`,
          amount: 250.00,
          status: 'pendente',
          submittedBy: 'Colaborador Teste',
          receiptUrl: '/placeholder-receipt.png',
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes do relatório:', error);
        setReport(null); // Garante que setReport é usado no erro
      } finally {
        setLoading(false);
      }
    };
    fetchReportDetails();
  }, [reportId, router]);

  const handleValidation = async (status: 'aprovado' | 'rejeitado') => {
    if (!report) return;

    console.log(`Validando relatório ${report.id} como: ${status} com comentário: "${comment}"`);
    try {
      alert(`Relatório ${report.id} ${status} com sucesso!`);
      router.push('/pendingExpenses');
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

// Exporta a página principal, envolvendo o conteúdo em Suspense
export default function ValidateExpensePage() { // Renomeada a função de exportação
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando página de validação...</p>
      </div>
    }>
      <ValidateExpenseContent />
    </Suspense>
  );
}