// frontend/src/app/signExpense/page.tsx
'use client'; // Necessário para Web Cryptography API e interatividade

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ExpenseReportToSign {
  id: string;
  description: string;
  amount: number;
  status: string; // Deve ser 'aprovado' para assinar
  submittedBy: string;
  receiptUrl: string;
  // Adicione outros campos
}

export default function SignExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const [report, setReport] = useState<ExpenseReportToSign | null>(null);
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<string | null>(null); // Armazenará a assinatura gerada

  useEffect(() => {
    if (!reportId) {
      // Redireciona se não houver ID
      router.push('/signedExpenses'); // Ou outra página relevante
      return;
    }

    // TODO: Chamar API do backend para buscar o relatório aprovado pelo ID
    const fetchReport = async () => {
      try {
        // Ex: const response = await fetch(`/api/expenses/${reportId}/approved`);
        // const data = await response.json();
        // setReport(data);
        // Dados mock para exemplo:
        setReport({
          id: reportId,
          description: `Relatório Aprovado para Assinatura (ID: ${reportId})`,
          amount: 300.50,
          status: 'aprovado',
          submittedBy: 'Colaborador X',
          receiptUrl: '/placeholder-receipt.png', // Substitua por URL real
        });
      } catch (error) {
        console.error('Erro ao buscar relatório para assinatura:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, router]);

  const generateAndSign = async () => {
    if (!report) {
      alert('Nenhum relatório para assinar.');
      return;
    }

    // Dados que serão assinados - certifique-se de que são os mesmos usados na verificação
    const dataToSign = JSON.stringify({
      id: report.id,
      description: report.description,
      amount: report.amount,
      submittedBy: report.submittedBy,
    });

    try {
      // 1. Gerar um par de chaves (se ainda não tiver)
      // Em uma aplicação real, você gerenciaria chaves de forma mais robusta (IndexedDB, backend, etc.)
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true, // exportable
        ["sign", "verify"]
      );

      // 2. Assinar os dados
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(dataToSign);

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        keyPair.privateKey,
        encodedData
      );

      // Converter a assinatura para Base64 (para fácil armazenamento/transmissão)
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
      setSignature(base64Signature);

      // TODO: Enviar a assinatura e a chave pública (ou um identificador da chave) para o backend
      // console.log("Assinatura gerada:", base64Signature);
      // console.log("Chave Pública (para verificação):", await window.crypto.subtle.exportKey('jwk', keyPair.publicKey));

      alert('Relatório assinado com sucesso! (Assinatura gerada no console)');
      router.push('/signedExpenses'); // Redireciona para ver relatórios assinados
    } catch (error) {
      console.error('Erro ao assinar o relatório:', error);
      alert('Falha ao assinar o relatório. Verifique o console para detalhes.');
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
