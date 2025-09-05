import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Shield, User } from 'lucide-react';


interface DashboardStats {
  total: number;
  estudiantes: number;
  personal: number;
  administradores: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar estadísticas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return null;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 24px #0001' }}>
      <div style={{ background: 'linear-gradient(90deg, #047857 0%, #65a30d 100%)', padding: '32px 32px 20px 32px' }}>
        <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <div style={{ color: '#e0e0e0', fontSize: 20, marginTop: 8 }}>Panel de control y estadísticas del sistema</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, padding: 40, background: '#f8fafc', justifyContent: 'center' }}>
        <div style={cardStyle('#8b5cf6')}>
          <Users size={40} />
          <div style={countStyle}>{stats.total}</div>
          <div style={labelStyle}>Total Usuarios</div>
        </div>
        <div style={cardStyle('#3b82f6')}>
          <GraduationCap size={40} />
          <div style={countStyle}>{stats.estudiantes}</div>
          <div style={labelStyle}>Estudiantes</div>
        </div>
        <div style={cardStyle('#22c55e')}>
          <User size={40} />
          <div style={countStyle}>{stats.personal}</div>
          <div style={labelStyle}>Personal</div>
        </div>
        <div style={cardStyle('#f59e42')}>
          <Shield size={40} />
          <div style={countStyle}>{stats.administradores}</div>
          <div style={labelStyle}>Administradores</div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = (color: string) => ({
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 2px 12px #0001',
  padding: '32px 40px',
  minWidth: 220,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 8,
  borderLeft: `8px solid ${color}`,
});

const countStyle = {
  fontSize: 36,
  fontWeight: 700,
  color: '#22223b',
  margin: '8px 0 0 0',
};

const labelStyle = {
  fontSize: 18,
  color: '#475569',
  marginTop: 4,
  fontWeight: 500,
};

export default Dashboard;
