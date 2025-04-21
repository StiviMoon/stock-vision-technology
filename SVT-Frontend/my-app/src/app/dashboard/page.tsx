'use client';

import { motion } from 'framer-motion';
import { useTheme } from './Theme/ThemeContext';
import { BarChart2, Package, Users, ArrowUpRight, Activity, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { theme } = useTheme();

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  // Datos para las tarjetas
  const cards = [
    {
      title: 'Productos',
      value: '1,534',
      change: '+12.3%',
      positive: true,
      icon: <Package size={20} />,
      color: 'var(--primary)'
    },
    {
      title: 'Proveedores',
      value: '64',
      change: '+3.2%',
      positive: true,
      icon: <Users size={20} />,
      color: 'var(--chart-2)'
    },
    {
      title: 'Actividad',
      value: '286',
      change: '-2.1%',
      positive: false,
      icon: <Activity size={20} />,
      color: 'var(--chart-5)'
    }
  ];

  return (
    <div className="p-8  md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Encabezado */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
          </div>
          <div className="bg-card rounded-xl p-2 border border-border hidden md:block">
            <div className="text-xs text-muted-foreground">
              Última actualización: <span className="text-foreground font-medium">Hoy, 10:30 AM</span>
            </div>
          </div>
        </motion.div>
        
        {/* Tarjetas principales */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div style={{ backgroundColor: card.color }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white">
                  {card.icon}
                </div>
                <div className={`flex items-center ${card.positive ? 'text-green-500' : 'text-red-500'} text-sm font-medium`}>
                  {card.change}
                  <ArrowUpRight size={14} className={`ml-1 ${!card.positive ? 'transform rotate-90' : ''}`} />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{card.value}</h2>
                <p className="text-muted-foreground text-sm">{card.title}</p>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Sección de actividad y estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal */}
          <div className="lg:col-span-2 bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Estadísticas Mensuales</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                Ver reporte <ArrowUpRight size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="h-64 bg-secondary/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart2 size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Datos de gráfico irán aquí</p>
              </div>
            </div>
          </div>
          
          {/* Panel lateral */}
          <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Actividad Reciente</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium">Ver todo</button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Settings size={14} className="text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Se actualizó el inventario de productos</p>
                      <p className="text-xs text-muted-foreground mt-1">Hace {index + 1} hora{index > 0 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Sección adicional */}
        <motion.div variants={itemVariants} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">Resumen General</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Diario</button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Semanal</button>
              <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">Mensual</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Inventario', 'Ventas', 'Compras', 'Devoluciones'].map((label, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/10 border border-border">
                <p className="text-muted-foreground text-sm mb-1">{label}</p>
                <p className="text-2xl font-bold">{Math.floor(Math.random() * 1000)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}