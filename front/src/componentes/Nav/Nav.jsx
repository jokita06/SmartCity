import './Nav.css';
import logoBranca from '../../assets/logoBranca.png'

export function Nav() {
    return (
        <div className='container'>
            <div className='conteudo-nav'>
                <img className='logo' src={logoBranca} alt="Logo" />
            </div>
        </div>
    );
}