import './Footer.css'
import { FaGithub } from 'react-icons/fa'

// Componente de rodapé do site
export function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">

                {/* Parte principal do rodapé */}
                <div className="footer-main">

                    {/* Texto de autoria */}
                    <div className="footer-brand">
                        <p className="footer-text">
                            Desenvolvido por Joyce Kelly
                        </p>
                        <p className="footer-subtext">Projeto integrador</p>
                    </div>

                    {/* Link para o GitHub */}
                    <div className="footer-social">
                        <a 
                            href="https://github.com/jokita06"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                        >
                            <FaGithub className="social-icon" />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>

                {/* Parte inferior do rodapé */}
                <div className="footer-bottom">
                    <p>© 2025 Todos os direitos reservados</p>
                </div>
            </div>
        </footer>
    )
}