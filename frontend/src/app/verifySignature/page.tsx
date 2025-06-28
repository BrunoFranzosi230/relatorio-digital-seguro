// frontend/src/app/verifySignature/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Importe Suspense
import { useRouter, useSearchParams } from 'next/navigation';

interface SignedReportDetails {
  id: string;
  description: string;
  amount: number;
  signedBy: string;
  signature: string; // Assinatura em Base64
  publicKeyJwk: JsonWebKey; // Chave pública em formato JWK (JSON Web Key)
  receiptUrl: string;
  // Adicione outros campos necessários
}

// Componente Wrapper para usar useSearchParams
function VerifySignatureContent() { // Renomeado o componente principal
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const [report, setReport] = useState<SignedReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      router.push('/signedExpenses');
      return;
    }

    const fetchSignedReport = async () => {
      try {
        setReport({
          id: reportId,
          description: `Relatório Assinado (ID: ${reportId})`,
          amount: 450.00,
          signedBy: 'Diretor Exemplo',
          signature: 'MOCK_BASE64_SIGNATURE_HERE',
          publicKeyJwk: {
            kty: "RSA",
            alg: "RSASSA-PKCS1-v1_5",
            n: "MOCK_N_VALUE_HERE",
            e: "AQAB",
            ext: true,
            key_ops: ["verify"],
          },
          receiptUrl: '/placeholder-receipt.png',
        });
      } catch (error) {
        console.error('Erro ao buscar relatório assinado para verificação:', error);
        setReport(null); // Garante que setReport é usado no erro
        setVerificationStatus('Erro ao carregar detalhes do relatório.'); // Garante que setVerificationStatus é usado
      } finally {
        setLoading(false);
      }
    };
    fetchSignedReport();
  }, [reportId, router]);

  const handleVerifySignature = async () => {
    if (!report || !report.signature || !report.publicKeyJwk) {
      setVerificationStatus('Dados insuficientes para verificação.');
      return;
    }

    try {
      const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        report.publicKeyJwk,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        true,
        ["verify"]
      );

      const dataToVerify = JSON.stringify({
        id: report.id,
        description: report.description,
        amount: report.amount,
        signedBy: report.signedBy,
      });
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(dataToVerify);

      const signatureBuffer = Uint8Array.from(atob(report.signature), c => c.charCodeAt(0));

      const isValid = await window.crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        publicKey,
        signatureBuffer,
        encodedData
      );

      setVerificationStatus(isValid ? 'Assinatura Válida!' : 'Assinatura Inválida!');
      alert(isValid ? 'Assinatura Digital Válida!' : 'Assinatura Digital Inválida!');

    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setVerificationStatus('Erro durante a verificação.'); // Garante que setVerificationStatus é usado
      alert('Ocorreu um erro ao verificar a assinatura. Verifique o console.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando detalhes do relatório para verificação...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500">
        <p>Relatório assinado não encontrado ou erro ao carregar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Verificar Assinatura Digital</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Detalhes do Relatório:</h2>
        <p className="mb-2"><span className="font-semibold">ID:</span> {report.id}</p>
        <p className="mb-2"><span className="font-semibold">Descrição:</span> {report.description}</p>
        <p className="mb-2"><span className="font-semibold">Valor:</span> R$ {report.amount.toFixed(2)}</p>
        <p className="mb-4"><span className="font-semibold">Assinado Por:</span> {report.signedBy}</p>
        <p className="mb-4"><span className="font-semibold">Assinatura (Base64):</span> <span className="break-all text-sm">{report.signature.substring(0, 50)}...</span></p>
        <p className="mb-4"><span className="font-semibold">Chave Pública (JWK):</span> <span className="break-all text-sm">{JSON.stringify(report.publicKeyJwk).substring(0, 50)}...</span></p>

        {report.receiptUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recibo:</h2>
            <img src={report.receiptUrl} alt="Recibo" className="max-w-full h-auto border rounded-lg shadow-sm" />
          </div>
        )}

        <button
          onClick={handleVerifySignature}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Verificar Assinatura
        </button>

        {verificationStatus && (
          <div className={`mt-6 p-4 rounded-lg text-center ${
            verificationStatus.includes('Válida') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            verificationStatus.includes('Inválida') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            <p className="font-semibold text-lg">{verificationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifySignaturePage() { // Renomeada a função de exportação
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p>Carregando página de verificação...</p>
      </div>
    }>
      <VerifySignatureContent />
    </Suspense>
  );
}