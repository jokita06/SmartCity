import { useEffect, useState } from "react";
import api from "../../api/Api";
import "./style/index.css"

// Formulário para criar ou editar um histórico
export function HistoricosForm({ item, action, onClose }) {
  // Estado para erros de validação
  const [errors, setErrors] = useState({});
  // Estado dos campos do formulário
  const [formData, setFormData] = useState({
    ambiente: '',
    sensor: '',
    valor: '',
    timestamp: ''
  });
  // Listas para os selects
  const [ambientes, setAmbientes] = useState([]);
  const [sensores, setSensores] = useState([]);

  // Carrega ambientes e sensores ao abrir o formulário
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const ambientesResponse = await api.get('ambientes/');
        const sensoresResponse = await api.get('sensores/');
        setAmbientes(ambientesResponse.data);
        setSensores(sensoresResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();

    // Se estiver editando, preenche os campos com os dados do item
    if (item) {
      setFormData({
        ambiente: item.ambiente || '',
        sensor: item.sensor || '',
        valor: item.valor || '',
        timestamp: item.timestamp || new Date().toISOString()
      });
    } else {
      // Se for criar, define data/hora atual
      setFormData(prev => ({
        ...prev,
        timestamp: new Date().toISOString()
      }));
    }
  }, [item]);

  // Atualiza campos quando o usuário altera algum valor
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Envia formulário para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (action === 'create') {
        await api.post('historico/', formData);
      } else {
        await api.put(`historico/${item.id}/`, formData);
      }
      if (onClose) onClose(); // Fecha modal/formulário
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  return (
    <form className='form-dashboard' onSubmit={handleSubmit}>
      <h2>{action === 'create' ? 'Adicionar' : 'Editar'} Histórico</h2>
      
      {/* Campo select de Ambiente */}
      <div className="form-group">
        <label>Ambiente:</label>
        <select
          name="ambiente"
          value={formData.ambiente}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um ambiente</option>
          {ambientes.map(ambiente => (
            <option key={ambiente.id} value={ambiente.id}>
              {ambiente.sig} - {ambiente.descricao}
            </option>
          ))}
        </select>
        {errors.ambiente && <span className="erro">{errors.ambiente}</span>}
      </div>

      {/* Campo select de Sensor */}
      <div className="form-group">
        <label>Sensor:</label>
        <select
          name="sensor"
          value={formData.sensor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um sensor</option>
          {sensores.map(sensor => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.sensor} ({sensor.mac_address})
            </option>
          ))}
        </select>
        {errors.sensor && <span className="erro">{errors.sensor}</span>}
      </div>

      {/* Campo de Valor */}
      <div className="form-group">
        <label>Valor:</label>
        <input
          type="number"
          step="any"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          required
          placeholder="Valor registrado"
        />
        {errors.valor && <span className="erro">{errors.valor}</span>}
      </div>

      {/* Campo de Data/Hora */}
      <div className="form-group">
        <label>Data/Hora:</label>
        <input
          type="datetime-local"
          name="timestamp"
          value={formData.timestamp ? formData.timestamp.slice(0, 16) : ''}
          onChange={handleChange}
          required
        />
        {errors.timestamp && <span className="erro">{errors.timestamp}</span>}
      </div>

      {/* Botões */}
      <div className="formulario-botoes">
        <button type="submit" className="btn-enviar">
          Salvar
        </button>
        <button type="button" className="btn-cancelar" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  );
}