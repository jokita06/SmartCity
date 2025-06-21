import { useEffect, useState } from "react";
import api from "../../api/Api";
import "./style/index.css";

export function AmbientesForm({ item, action, onClose }) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    sig: '',
    descricao: '',
    ni: '',
    responsavel: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        sig: item.sig || '',
        descricao: item.descricao || '',
        ni: item.ni || '',
        responsavel: item.responsavel || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (action === 'create') {
        await api.post('ambientes/', formData);
      } else {
        await api.put(`ambientes/${item.id}/`, formData);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  return (
    <form className='form-dashboard' onSubmit={handleSubmit}>
      <h2>{action === 'create' ? 'Adicionar' : 'Editar'} Ambiente</h2>
      
      <div className="form-group">
        <label>SIG:</label>
        <input
          type="number"
          name="sig"
          value={formData.sig}
          onChange={handleChange}
          required
          placeholder="Número identificador do ambiente"
        />
        {errors.sig && <span className="erro">{errors.sig}</span>}
      </div>

      <div className="form-group">
        <label>Descrição:</label>
        <input
          type="text"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          required
          placeholder="Descrição do ambiente"
        />
        {errors.descricao && <span className="erro">{errors.descricao}</span>}
      </div>

      <div className="form-group">
        <label>NI:</label>
        <input
          type="text"
          name="ni"
          value={formData.ni}
          onChange={handleChange}
          required
          placeholder="Número de identificação"
        />
        {errors.ni && <span className="erro">{errors.ni}</span>}
      </div>

      <div className="form-group">
        <label>Responsável:</label>
        <input
          type="text"
          name="responsavel"
          value={formData.responsavel}
          onChange={handleChange}
          required
          placeholder="Nome do responsável"
        />
        {errors.responsavel && <span className="erro">{errors.responsavel}</span>}
      </div>

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