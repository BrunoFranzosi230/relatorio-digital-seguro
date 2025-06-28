// frontend/src/app/dashboard/page.tsx
// Esta página pode ser Server Component por padrão se não tiver interatividade direta com o usuário (useState, onClick)

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard do Sistema</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Relatórios Pendentes</h2>
          <p className="text-gray-600 dark:text-gray-400 text-3xl">5</p>
          <a href="/pendingExpenses" className="text-blue-500 hover:underline mt-4 block">Ver Detalhes</a>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Funcionários Cadastrados</h2>
          <p className="text-gray-600 dark:text-gray-400 text-3xl">25</p>
          <a href="/employees" className="text-blue-500 hover:underline mt-4 block">Gerenciar</a>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Submeter Novo Relatório</h2>
          <p className="text-gray-600 dark:text-gray-400 text-3xl">📊</p>
          <a href="/submitExpense" className="text-blue-500 hover:underline mt-4 block">Criar Relatório</a>
        </div>
      </div>
      <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
        Use o menu de navegação ou os cartões acima para acessar as funcionalidades.
      </p>
    </div>
  );
}
