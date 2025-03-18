import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [email, setEmail] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    useEffect(() => {
        document.title = "Redefinição de senha";
        if (!token) {
            toast.error('Token inválido ou ausente. Solicite a recuperação novamente.', {
                position: 'top-right',
                autoClose: 3000,
            });
            navigate('/login');
        }

        const storedEmail = sessionStorage.getItem('reset_email');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, [token, navigate]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

try {
    const response = await resetPassword(token, newPassword);
    console.log('Resposta da API:', response);

    toast.success('Senha redefinida com sucesso! Redirecionando...', {
        position: 'top-right',
        autoClose: 2000,
    });

    sessionStorage.removeItem('reset_email');

    setTimeout(() => {
        navigate('/login');
    }, 2000);
} catch (err) {
    console.error('Erro ao redefinir senha:', err.response ? err.response.data : err);

    if (err.response) {
        console.log('Resposta detalhada da API:', err.response);
        toast.error(`Erro: ${err.response.data.message || 'Erro desconhecido'}`, {
            position: 'top-right',
            autoClose: 3000,
        });
    } else {
        toast.error('Erro interno. Tente novamente mais tarde.', {
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
                        <h2>Escolha a nova senha</h2>
                        <p>Escolha a senha que vai proteger a sua conta.</p>
                        {email && <p><strong>Email associado:</strong> {email}</p>}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleResetPassword}>
                        <div className="login-input-group">
                            <label>Nova senha</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite a sua nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </div>
                        </div>
                        
                        <div className="login-input-group">
                            <label>Confirme a nova senha</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirme a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">
                                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="login-button">Atualizar senha</button>
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

export default RedPage;