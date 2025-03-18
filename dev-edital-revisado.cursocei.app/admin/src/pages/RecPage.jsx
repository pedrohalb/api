import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/api'; // Importa a função de recuperação de senha

const RecPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "Recuperação de senha";
        // Limpa o token de sessão ao voltar para a página de recuperação
        sessionStorage.removeItem('token');
        console.log('Token de sessão removido.');
    }, []);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        console.log('Solicitando recuperação para o e-mail:', email);

        try {
            // Faz a solicitação para o endpoint de recuperação de senha
            const response = await forgotPassword(email);
            console.log('Resposta da API:', response);

            // Salva a role temporariamente para a redefinição de senha
            sessionStorage.setItem('reset_email', email);

            // Exibe notificação de sucesso
            toast.success('E-mail de recuperação enviado. Verifique sua caixa de entrada.', {
                position: 'top-right',
                autoClose: 3000,
            });

        } catch (err) {
            console.error('Erro ao solicitar recuperação de senha:', err);

            // Se a API retorna um erro, verifica se é um problema de e-mail não encontrado
            if (err.response) {
                console.error('Usuário não encontrado:', email);
                toast.error('E-mail não encontrado. Verifique o endereço informado.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-left-content">
                    <img src={`${process.env.PUBLIC_URL}/images/bg-login.webp`} alt="Login Background" className="login-bg-image" />
                    <div className="login-image-overlay"></div>
                    <div className="login-text">
                        <h2>Se prepare para Editais de forma otimizada.</h2>
                        <p>Com o Edital Revisado, você vai aprender de forma moderna, preparando-se de forma completa para seus editais.</p>
                    </div>
                </div>
                <img src={`${process.env.PUBLIC_URL}/images/lines.svg`} alt="Decorative Lines" className="login-decorative-lines" />
            </div>

            <div className="login-right">
                <div className="login-form-container">
                    <img src={`${process.env.PUBLIC_URL}/images/logo-transparent.png`} alt="Logo" className="login-logo" />
                    <div className="login-header">
                        <h2>Esqueceu a senha?</h2>
                        <p>Preencha o seu e-mail para receber o link de recuperação.</p>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleForgotPassword}>
                        <div className="login-input-group">
                            <label>Digite o seu e-mail</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Enviar Recuperação</button>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '1rem',
                            }}
                        >
                            <a
                                href="/login"
                                style={{
                                    fontSize: '0.9rem',
                                    color: '#333',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                }}
                            >
                                Voltar para o login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RecPage;
