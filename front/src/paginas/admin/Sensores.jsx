import { useEffect, useState } from "react";
import "./style/index.css"; 
import { FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Modal } from "../../componentes/modal/Modal";
import { SensoresForm } from "../../componentes/formulario/SensoresForm";
import api from "../../api/Api";
import { useNavigate } from 'react-router-dom';

const fields = {
  sensores: {
    endpoint: 'sensores/',
    fields: ['sensor', 'mac_address', 'unidade_med', 'latitude', 'longitude', 'status'],
    fieldNames: ['Sensor', 'Mac Address', 'Unidade de Medida', 'Latitude', 'Longitude', 'Status']
  }
};

const sensorTypes = [
  { label: "Temperatura", value: "temperatura" },
  { label: "Umidade", value: "umidade" },
  { label: "Luminosidade", value: "luminosidade" },
  { label: "Contador", value: "contador" }
];


export function Sensores() {
  const [sensores, setSensores] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [filteredSensores, setFilteredSensores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();
  
  // Estados para os modais
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const response = await api.get(fields.sensores.endpoint);
        setSensores(response.data);
        setFilteredSensores(response.data);
        setTotalItems(response.data.length);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensores();
  }, []);

  useEffect(() => {
    if (selectedType === "") {
      setFilteredSensores(sensores);
      setTotalItems(sensores.length);
    } else {
      const filtered = sensores.filter(item =>
        item.sensor.toLowerCase() === selectedType.toLowerCase()
      );
      setFilteredSensores(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [selectedType, sensores]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSensores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  const handleAddSensor = () => {
    setActionType('create');
    setSelectedSensor(null);
    setModalContent(
      <SensoresForm 
        item={null} 
        action="create" 
        onClose={() => {
          setShowModal(false);
          refreshData();
        }} 
      />
    );
    setShowModal(true);
  };

  const handleEditSensor = (sensor) => {
    setActionType('edit');
    setSelectedSensor(sensor);
    setModalContent(
      <SensoresForm 
        item={sensor} 
        action="edit" 
        onClose={() => {
          setShowModal(false);
          refreshData();
        }} 
      />
    );
    setShowModal(true);
  };

  const handleDeleteSensor = (sensor) => {
    setActionType('delete');
    setSelectedSensor(sensor);
    setModalContent(
      <div className="delete-confirmacao">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir o sensor {sensor.sensor} ({sensor.mac_address})?</p>
        <div className="botoes-modal">
          <button 
            className="btn-cancelar" 
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirmar" 
            onClick={async () => {
              try {
                await api.delete(`sensores/${sensor.id}/`);
                setShowModal(false);
                refreshData();
              } catch (error) {
                console.error("Erro ao deletar:", error);
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    );
    setShowModal(true);
  };

  const refreshData = async () => {
    try {
      const response = await api.get(fields.sensores.endpoint);
      setSensores(response.data);
      setFilteredSensores(response.data);
      setTotalItems(response.data.length);
    } catch (error) {
      console.error("Error refreshing sensor data:", error);
    }
  };

  return (
    <main className="sensores-container">
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalContent}
        </Modal>
      )}

      <header className="sensores-header">
        <h1>Dados dos Sensores</h1>
        <button className="add-btn" onClick={handleAddSensor}>+ Add registro</button>
      </header>

      <div className="sensores-filtro">
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Todos</option>
          {sensorTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <button onClick={() => navigate('/ambientes')}>Visualizar ambientes</button>
        <button onClick={() => navigate('/historicos')}>Visualizar histórico</button>
      </div>

      <section aria-label="Tabela de sensores">
        <table className="sensores-tabela">
          <thead>
            <tr>
              {fields.sensores.fieldNames.map(name => (
                <th key={name} scope="col">{name}</th>
              ))}
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.id}>
                {fields.sensores.fields.map(field => (
                  <td key={`${item.id}-${field}`}>
                    {field === 'status' ? (
                      <span className={`status ${item[field] ? "ativo" : "inativo"}`}>
                        {item[field] ? "Ativo" : "Inativo"}
                      </span>
                    ) : (
                      item[field]
                    )}
                  </td>
                ))}
                <td>
                  <button 
                    className="acoes-btn" 
                    aria-label="Editar" 
                    title="Editar"
                    onClick={() => handleEditSensor(item)}
                  >
                    <MdModeEdit />
                  </button>
                  <button 
                    className="acoes-btn" 
                    aria-label="Excluir" 
                    title="Excluir"
                    onClick={() => handleDeleteSensor(item)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <nav className="controle-paginacao" aria-label="Paginação">
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="paginacao-btn"
          aria-label="Primeira página"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="paginacao-btn"
          aria-label="Página anterior"
        >
          <FaAngleLeft />
        </button>

        <span className="paginacao-info">
          Página {currentPage} de {totalPages} | Total: {totalItems} itens
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="paginacao-btn"
          aria-label="Próxima página"
        >
          <FaAngleRight />
        </button>
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className="paginacao-btn"
          aria-label="Última página"
        >
          <FaAngleDoubleRight />
        </button>
      </nav>
    </main>
  );
}