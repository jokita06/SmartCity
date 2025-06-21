import { useEffect, useState } from "react";
import api from "../../api/Api";
import "./style/index.css";

// Formulário para criar ou editar sensor
export function SensoresForm({ item, action, onClose }) {
  // Estado para erros de validação
  const [errors, setErrors] = useState({});
  // Estado dos dados do formulário
  const [formData, setFormData] = useState({
    sensor: '',
    mac_address: '',
    unidade_med: '',
    latitude: '',
    longitude: '',
    status: false
  });

  // Se tiver item (editar), preenche o formulário com os dados
  useEffect(() => {
    if (item) {
      setFormData({
        sensor: item.sensor || '',
        mac_address: item.mac_address || '',
        unidade_med: item.unidade_med || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
        status: item.status || false
      });
    }
  }, [item]);

  // Atualiza estado quando usuário digita ou marca checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Envia dados para API criar ou editar sensor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (action === 'create') {
        await api.post('sensores/', formData);
      } else {
        await api.put(`sensores/${item.id}/`, formData);
      }
      if (onClose) onClose(); // Fecha formulário/modal
    } catch (error) {
      console.error('Erro ao salvar sensor:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Mostra erros da API
      }
    }
  };

  return (
    <form className='form-dashboard' onSubmit={handleSubmit}>
      <h2>{action === 'create' ? 'Adicionar' : 'Editar'} Sensor</h2>
      
      {/* Tipo de sensor */}
      <div className="form-group">
        <label>Tipo de Sensor:</label>
        <select
          name="sensor"
          value={formData.sensor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um tipo</option>
          <option value="temperatura">Temperatura</option>
          <option value="umidade">Umidade</option>
          <option value="luminosidade">Luminosidade</option>
          <option value="contador">Contador</option>
        </select>
        {errors.sensor && <span className="erro">{errors.sensor}</span>}
      </div>

      {/* Mac Address */}
      <div className="form-group">
        <label>Mac Address:</label>
        <input
          type="text"
          name="mac_address"
          value={formData.mac_address}
          onChange={handleChange}
          required
          placeholder="00:1A:2B:3C:4D:5E"
        />
        {errors.mac_address && <span className="erro">{errors.mac_address}</span>}
      </div>

      {/* Unidade de medida */}
      <div className="form-group">
        <label>Unidade de Medida:</label>
        <input
          type="text"
          name="unidade_med"
          value={formData.unidade_med}
          onChange={handleChange}
          required
          placeholder="Ex: °C, %, lux"
        />
        {errors.unidade_med && <span className="erro">{errors.unidade_med}</span>}
      </div>

      {/* Latitude */}
      <div className="form-group">
        <label>Latitude:</label>
        <input
          type="text"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
          placeholder="Ex: -23.5505"
        />
        {errors.latitude && <span className="erro">{errors.latitude}</span>}
      </div>

      {/* Longitude */}
      <div className="form-group">
        <label>Longitude:</label>
        <input
          type="text"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
          placeholder="Ex: -46.6333"
        />
        {errors.longitude && <span className="erro">{errors.longitude}</span>}
      </div>

      {/* Status ativo */}
      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />
          Ativo
        </label>
      </div>

      {/* Botões salvar e cancelar */}
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