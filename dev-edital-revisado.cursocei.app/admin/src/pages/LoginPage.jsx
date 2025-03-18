import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Verificar se o usuário já está logado
    useEffect(() => {
        document.title = "Edital Revisado";
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const role = localStorage.getItem('role') || sessionStorage.getItem('role');

        if (token) {
            navigate(role === 'admin' ? '/admin/editais' : '/editais');
        }
    }, [navigate]);

    // Recuperar credenciais salvas ao carregar a página
    useEffect(() => {
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');

        if (savedRememberMe && savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await loginUser(email, password);

            const { token, role } = response;

            if (token) {
                if (rememberMe) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    localStorage.setItem('savedEmail', email);
                    localStorage.setItem('savedPassword', password);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('role', role);
                    localStorage.removeItem('savedEmail');
                    localStorage.removeItem('savedPassword');
                    localStorage.removeItem('rememberMe');
                }

                toast.success("Login feito com sucesso");

                // Redirecionamento com base na role
                navigate(role === 'admin' ? '/admin/editais' : '/editais');
            }
        } catch (err) {
            console.error('Erro ao tentar login:', err);
            setError('E-mail ou senha incorretos. Tente novamente.');
            toast.error('E-mail ou senha incorretos.');
        } finally {
            setIsLoading(false);
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
                        <h2>Conectar sua Conta</h2>
                        <p>Faça login para acessar a plataforma.</p>
                    </div>
            
                    {error && <p className="error-message">{error}</p>}
            
                    <form onSubmit={handleLogin}>
                        <div className="login-input-group">
                            <label>Digite o seu email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="login-input-group">
                            <label>Digite a sua senha</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </div>
                        </div>

                        <div className="login-options">
                            <div className="remember-me" onClick={() => setRememberMe(!rememberMe)}>
                                <div className={`checkbox ${rememberMe ? 'checked' : ''}`} style={{ marginRight: '0.5rem' }}>
                                    {rememberMe && <FaCheck color="white" />}
                                </div>
                                <label>Lembrar acesso</label>
                            </div>
                            <a href="/recuperacao-senha" className="forgot-password">Esqueci minha senha</a>
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Acessar Conta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;