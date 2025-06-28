// frontend/src/app/submitExpense/page.tsx
'use client'; // Necessário para estado de formulário e upload de arquivo

import React, { useState } from 'react';

export default function SubmitExpensePage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submetendo relatório:', { description, amount, receipt });
    // TODO: Lógica para enviar o relatório e o arquivo para o backend
    // Utilize FormData para enviar o arquivo:
    // const formData = new FormData();
    // formData.append('description', description);
    // formData.append('amount', amount);
    // if (receipt) formData.append('receipt', receipt);
    // await fetch('/api/expenses/submit', { method: 'POST', body: formData });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Submeter Relatório de Despesa</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Descrição:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Valor:
            </label>
            <input
              type="number"
              id="amount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="receipt" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Anexar Recibo:
            </label>
            <input
              type="file"
              id="receipt"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-white"
              onChange={(e) => setReceipt(e.target.files ? e.target.files[0] : null)}
              accept="image/*,.pdf"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Submeter Relatório
          </button>
        </form>
      </div>
    </div>
  );
}
