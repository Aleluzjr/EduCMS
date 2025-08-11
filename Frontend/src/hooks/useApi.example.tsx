/**
 * EXEMPLOS DE USO DOS HOOKS DE API
 * 
 * Este arquivo demonstra como usar corretamente os hooks useApi, useAuthApi e useCrudApi
 * para evitar erros de refresh e garantir o funcionamento correto da autenticação.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, useAuthApi, useCrudApi } from './useApi';

// EXEMPLO 1: Hook para requisições sem autenticação
const PublicApiExample: React.FC = () => {
  const { execute, data, error, isLoading } = useApi();

  useEffect(() => {
    // Executar requisição para endpoint público
    execute('/api/public-data');
  }, [execute]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return <div>Dados públicos: {JSON.stringify(data)}</div>;
};

// EXEMPLO 2: Hook para requisições com autenticação
const AuthenticatedApiExample: React.FC = () => {
  const { refreshAuth } = useAuth(); // ✅ SEMPRE obter refreshAuth do AuthContext
  const { execute, data, error, isLoading } = useAuthApi(refreshAuth); // ✅ Passar refreshAuth como parâmetro

  useEffect(() => {
    // Executar requisição para endpoint autenticado
    execute('/api/protected-data');
  }, [execute]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return <div>Dados protegidos: {JSON.stringify(data)}</div>;
};

// EXEMPLO 3: Hook para operações CRUD
const CrudApiExample: React.FC = () => {
  const { refreshAuth } = useAuth(); // ✅ SEMPRE obter refreshAuth do AuthContext
  const { 
    create, 
    update, 
    get, 
    remove, 
    data, 
    error, 
    isLoading 
  } = useCrudApi(refreshAuth); // ✅ Passar refreshAuth como parâmetro

  const handleCreate = () => {
    create('/api/users', { name: 'João', email: 'joao@email.com' });
  };

  const handleUpdate = () => {
    update('/api/users/1', { name: 'João Silva' });
  };

  const handleGet = () => {
    get('/api/users/1');
  };

  const handleDelete = () => {
    remove('/api/users/1');
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      <button onClick={handleCreate}>Criar</button>
      <button onClick={handleUpdate}>Atualizar</button>
      <button onClick={handleGet}>Buscar</button>
      <button onClick={handleDelete}>Remover</button>
      <div>Dados: {JSON.stringify(data)}</div>
    </div>
  );
};

// EXEMPLO 4: Uso em componente de lista
const UserListExample: React.FC = () => {
  const { refreshAuth } = useAuth();
  const { get, data: users, error, isLoading } = useCrudApi(refreshAuth);

  useEffect(() => {
    get('/api/users');
  }, [get]);

  if (isLoading) return <div>Carregando usuários...</div>;
  if (error) return <div>Erro ao carregar usuários: {error.message}</div>;
  
  return (
    <div>
      <h2>Lista de Usuários</h2>
      {users && Array.isArray(users) && users.map((user: any) => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  );
};

// EXEMPLO 5: Uso com formulário
const UserFormExample: React.FC = () => {
  const { refreshAuth } = useAuth();
  const { create, update, error, isLoading } = useCrudApi(refreshAuth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string
    };

    // Se tiver ID, atualizar; senão, criar
    const userId = formData.get('id') as string;
    if (userId) {
      update(`/api/users/${userId}`, userData);
    } else {
      create('/api/users', userData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="id" type="hidden" />
      <input name="name" placeholder="Nome" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
      {error && <div style={{ color: 'red' }}>{error.message}</div>}
    </form>
  );
};

export {
  PublicApiExample,
  AuthenticatedApiExample,
  CrudApiExample,
  UserListExample,
  UserFormExample
};
