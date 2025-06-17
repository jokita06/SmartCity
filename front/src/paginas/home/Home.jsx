import './Home.css';
import cidade from '../../assets/cidade.svg';
import { MdOutlineSensors } from "react-icons/md";
import { MdOutlinePlace } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";

export function Home() {
  return (
    <>
      <header className="home-header">
        <div className="header-conteudo">
          <h1>SmartHub</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <button className="botao-login">Comece aqui</button>
        </div>

        <img 
          src={cidade} 
          alt="Ilustação de uma cidade" 
          className="imagem-cidade"
        />
      </header>

      <main className='home-main'>
        <section className='services-section'>
            <h2 className='section-titles'>Nossos Serviços</h2>
            <p>
                Gerencie de forma inteligente os sensores urbanos, monitore os ambientes em tempo real e acompanhe o histórico completo de dados da cidade.
            </p>
            
            <div className='services-container'>
                <article className='service-card'>
                    <MdOutlineSensors />
                    <h3>Sensores</h3>
                </article>

                <article className='service-card'>
                    <MdOutlinePlace />
                    <h3>Ambientes</h3>
                </article>

                <article className='service-card'>
                    <FaClipboardList />
                    <h3>Histórico</h3>
                </article>
            </div>
        </section>
      </main>
    </>
  );
}