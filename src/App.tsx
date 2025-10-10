import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RegisterAdmin from './components/RegisterAdmin';
import Chat from './components/Chat';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import DocumentManagement from './components/DocumentManagement';
import TicketManagement from './components/TicketManagement';
import MyTickets from './components/MyTickets';
import './App.css'; // Asumiendo que los estilos están en este archivo

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/gestion-usuarios.html" element={<UserManagement />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/gestion-documentos" element={<DocumentManagement />} />
          <Route path="/admin/tickets" element={<TicketManagement />} />
          <Route path="/admin/gestion-tickets" element={<TicketManagement />} />
          <Route path="/mis-tickets" element={<MyTickets />} />
          <Route path="/" element={<Login />} /> {/* Redirige al login por defecto */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;