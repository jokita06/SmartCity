import './Home.css';
import cidade from '../../assets/cidade.svg';
import { MdOutlineSensors } from "react-icons/md";
import { MdOutlinePlace } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <header className="home-header">
        <div className="header-conteudo">
          <h1>SmartHub</h1>
          <p>Transforme sua cidade em um ambiente inteligente com nosso sistema de monitoramento integrado.</p>

          {/* Botão para acessar a página de login */}
          <button className="botao-login">
            <Link to='/login' className='nav-link'>Comece aqui</Link>
          </button>
        </div>

        {/* Imagem ilustrativa da cidade */}
        <img 
          src={cidade} 
          alt="Ilustração de uma cidade" 
          className="imagem-cidade"
        />
      </header>

      <main className='home-main'>

        {/* Seção dos serviços do sistema */}
        <section className='section-servico'>
          <h2 className='section-titulo'>Nossos <span>Serviços</span></h2>
          <p className="section-subtitulo">
            Gerencie de forma inteligente os sensores urbanos, monitore ambientes em tempo real e acompanhe o histórico completo.
          </p>

          <div className='container-servicos'>
            <article className='card-servico'>
              <div className="card-icon">
                <MdOutlineSensors size={60} />
              </div>
              <h3>Sensores</h3>
              <p>Coleta de dados em tempo real da temperatura, luminosidade, de pessoas e da umidade</p>
            </article>

            <article className='card-servico'>
              <div className="card-icon">
                <MdOutlinePlace size={60} />
              </div>
              <h3>Monitoramento</h3>
              <p>Controle completo dos ambientes urbanos de qualquer lugar</p>
            </article>

            <article className='card-servico'>
              <div className="card-icon">
                <FaClipboardList size={60} />
              </div>
              <h3>Histórico Completo</h3>
              <p>Relatórios detalhados e análise temporal dos dados coletados</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}