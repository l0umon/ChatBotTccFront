import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL de la API
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`, // Si el token está en localStorage
  },
});

export default Api;
