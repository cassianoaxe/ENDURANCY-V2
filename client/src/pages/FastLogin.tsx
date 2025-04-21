import { useState } from 'react';
import '../index.css';

// Estilo minimalista e totalmente independente
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: '#111827'
  },
  content: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '16px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '8px'
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  },
  footer: {
    padding: '16px 24px',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#6b7280',
    borderTop: '1px solid #e2e8f0'
  },
  testCredentials: {
    marginTop: '16px',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#6b7280'
  }
};

// Estilos para a animação do spinner
const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function FastLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Login direto sem depender do contexto
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          userType: 'org_admin' 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no login');
      }
      
      const userData = await response.json();
      
      // Redirecionar diretamente sem depender de contextos ou estado
      if (userData.role === 'org_admin') {
        window.location.href = '/organization/dashboard';
      } else if (userData.role === 'admin') {
        window.location.href = '/dashboard';
      } else if (userData.role === 'doctor') {
        window.location.href = '/doctor/dashboard';
      } else if (userData.role === 'patient') {
        window.location.href = '/patient/dashboard';
      } else if (userData.role === 'pharmacist') {
        window.location.href = '/pharmacist/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      setError(error.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <style>{spinnerKeyframes}</style>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Acessar Endurancy</h1>
          </div>
          <div style={styles.content}>
            <form onSubmit={handleLogin}>
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email</label>
                <input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@organizacao.com"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Senha</label>
                <input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={styles.input}
                  required
                />
              </div>
              {error && <div style={styles.error}>{error}</div>}
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(isLoading ? styles.buttonDisabled : {})
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div style={styles.loadingSpinner} />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </button>
            </form>
            
            <div style={styles.testCredentials}>
              <p>Para fins de teste, use:</p>
              <p style={{fontWeight: 'bold'}}>Email: admin@organizacao.com</p>
              <p style={{fontWeight: 'bold'}}>Senha: senha123</p>
            </div>
          </div>
          <div style={styles.footer}>
            © 2025 Endurancy - Todos os direitos reservados
          </div>
        </div>
      </div>
    </>
  );
}