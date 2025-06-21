import { useEffect, useState } from 'react';
import './Nav.css';
import logoBranca from '../../assets/logoBranca.png'; 
import logoRoxa from '../../assets/logoRoxa.png';  
import { Link, useLocation } from 'react-router-dom';

// Componente de navegação do site
export function Nav() {
    // Estado para verificar se rolou a página
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Efeito para mudar o estado quando rolar a página
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    // Escolhe qual logo mostrar (branca ou roxa)
    const getLogo = () => {
        if (location.pathname === '/home' || location.pathname === '/') {
            return logoBranca; 
        } else {
            return scrolled ? logoBranca : logoRoxa; 
        }
    };

    return (
        <div className={`container ${scrolled ? 'scrolled' : ''}`}>
            <div className='conteudo-nav'>
                {/* Link para a página inicial com logo */}
                <Link to='/home' className='nav-link'>
                    <img className='logo' src={getLogo()} alt="Logo" />
                </Link>
            </div>
        </div>
    );
}