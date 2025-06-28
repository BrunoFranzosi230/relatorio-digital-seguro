// frontend/src/app/signExpense/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Defina as interfaces completas fora do componente, ou use as que já definiu no topo
interface ExpenseReportToSign {
  id: string;
  description: string;
  amount: number;
  status: string; // Deve ser 'aprovado' para assinar
  submittedBy: string;
  receiptUrl: string; // URL do recibo para visualização
  // Adicione outros campos necessários
}


function SignExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  // Use a interface específica que você já definiu para 'report'
  const [report, setReport] = useState<ExpenseReportToSign | null>(null); // ALTERADO: Usando a interface específica
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      router.push('/signedExpenses');
      return;
    }

    const fetchReport = async () => {
      try {
        // Simulação de fetch de dados
        setReport({
          id: reportId,
          description: `Relatório Aprovado para Assinatura (ID: ${reportId})`,
          amount: 300.50,
          status: 'aprovado',
          submittedBy: 'Colaborador X',
          receiptUrl: '/placeholder-receipt.png',
        });
      } catch (error) {
        console.error('Erro ao buscar relatório para assinatura:', error);
        setReport(null); // Garante que setReport é usado mesmo no erro
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, router]); // Dependências do useEffect

  const generateAndSign = async () => {
    if (!report) {
      alert('Nenhum relatório para assinar.');
      return;
    }

    const dataToSign = JSON.stringify({
      id: report.id,
      description: report.description,
      amount: report.amount,
      submittedBy: report.submittedBy,
    });

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
      );

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(dataToSign);

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        keyPair.privateKey,
        encodedData
      );

      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
      setSignature(base64Signature); // setSignature é usado aqui

      // TODO: Enviar a assinatura e a chave pública (ou um identificador da chave) para o backend
      console.log("Assinatura gerada:", base64Signature);
      console.log("Chave Pública (para verificação):", await window.crypto.subtle.exportKey('jwk', keyPair.publicKey));

      alert('Relatório assinado com sucesso! (Assinatura gerada no console)');
      router.push('/signedExpenses');
    } catch (error) {
      console.error('Erro ao assinar o relatório:', error);
      alert('Falha ao assinar o relatório. Verifique o console para detalhes.');
      setSignature(null); // Usar setSignature aqui para evitar o warning, mesmo em caso de erro
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando relatório para assinatura...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500">
        <p>Relatório não encontrado ou não está aprovado para assinatura.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Assinar Relatório Digitalmente</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Detalhes do Relatório:</h2>
        <p className="mb-2"><span className="font-semibold">ID:</span> {report.id}</p>
        <p className="mb-2"><span className="font-semibold">Descrição:</span> {report.description}</p>
        <p className="mb-2"><span className="font-semibold">Valor:</span> R$ {report.amount.toFixed(2)}</p>
        <p className="mb-4"><span className="font-semibold">Enviado Por:</span> {report.submittedBy}</p>

        {report.receiptUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recibo:</h2>
            <img src={report.receiptUrl} alt="Recibo" className="max-w-full h-auto border rounded-lg shadow-sm" />
          </div>
        )}

        <button
          onClick={generateAndSign}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Gerar e Assinar Digitalmente
        </button>

        {signature && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg break-all text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Assinatura Gerada (exemplo):</p>
            <p className="text-gray-800 dark:text-gray-200">{signature}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              (Esta assinatura precisaria ser salva no backend junto com o relatório e a chave pública para verificação posterior)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignExpensePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando página...</p>
      </div>
    }>
      <SignExpenseContent />
    </Suspense>
  );
}