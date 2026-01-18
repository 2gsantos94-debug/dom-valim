import React, { useState, useEffect } from 'react';
import { SERVICES, PROMOTIONS } from './constants';
import { Appointment, TimeSlot, Expense, AppointmentStatus, PaymentMethod } from './types';
import * as Storage from './services/storageService';
import { Button } from './components/Button';
import { Calendar, Clock, Scissors, X, CheckCircle2, History, ChevronLeft, ChevronRight, MapPin, Bell, Megaphone, FileText, Lock, Phone, MessageSquare, Edit3, LogOut, Filter, DollarSign, TrendingUp, TrendingDown, PlusCircle, Trash2, PieChart } from 'lucide-react';

type ViewState = 'home' | 'booking' | 'success' | 'my-appointments' | 'promotions' | 'admin' | 'login';

const Header = ({ 
  onViewChange, 
  currentView, 
  isLoggedIn 
}: { 
  onViewChange: (v: ViewState) => void, 
  currentView: ViewState,
  isLoggedIn: boolean
}) => (
  <header className="fixed top-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50">
    <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="font-bold text-xl tracking-tighter text-amber-500 flex items-center gap-2 cursor-pointer"
        onClick={() => onViewChange('home')}
      >
        <Scissors size={24} />
        DOM VAILM
      </div>
      <div className="flex items-center gap-2">
         {isLoggedIn ? (
            <button 
              onClick={() => onViewChange('admin')}
              className={`p-2 transition-colors ${currentView === 'admin' ? 'text-amber-500' : 'text-zinc-400 hover:text-white'}`}
              title="Painel do Dono"
            >
              <Lock size={22} className={currentView === 'admin' ? 'fill-current' : ''} />
            </button>
         ) : (
           <>
            <button
                onClick={() => onViewChange('promotions')}
                className={`p-2 transition-colors ${currentView === 'promotions' ? 'text-amber-500' : 'text-zinc-400 hover:text-white'}`}
                title="Promoções"
            >
                <Megaphone size={22} />
            </button>

            <button 
              onClick={() => onViewChange('my-appointments')}
              className={`p-2 transition-colors ${currentView === 'my-appointments' ? 'text-amber-500' : 'text-zinc-400 hover:text-white'}`}
              title="Meus Agendamentos"
            >
              <History size={24} />
            </button>

            <button
              onClick={() => onViewChange('login')}
              className={`p-2 transition-colors ${currentView === 'login' ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
              title="Área do Barbeiro"
            >
               <Lock size={16} />
            </button>
           </>
         )}
      </div>
    </div>
  </header>
);

const StepWizard = ({ step, title }: { step: number, title: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wider">
      Passo {step} de 3
    </div>
    <h2 className="text-2xl font-bold text-white">{title}</h2>
  </div>
);

export default function App() {
  // Navigation State
  const [view, setView] = useState<ViewState>('home');
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); 
  
  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [clientPreferences, setClientPreferences] = useState<string>('');
  
  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'agenda' | 'finance'>('agenda');
  const [adminDate, setAdminDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  
  // Admin Filters
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [filterServiceType, setFilterServiceType] = useState<string>('ALL');

  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Finance Form State
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Available dates
  const nextDays = React.useMemo(() => Storage.getNext7Days(), []);

  // Initialize
  useEffect(() => {
    const loadedApps = Storage.getAppointments();
    const loadedExpenses = Storage.getExpenses();
    setAppointments(loadedApps);
    setExpenses(loadedExpenses);

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Slots update
  useEffect(() => {
    if (selectedDate) {
      const slots = Storage.generateTimeSlots(selectedDate, appointments);
      setAvailableSlots(slots);
    }
  }, [selectedDate, appointments]);

  // Notifications
  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/483/483930.png' });
    }
  };

  // --- Handlers ---

  const handleStartBooking = () => {
    setSelectedDate(nextDays[0]?.value || '');
    setSelectedTime('');
    setSelectedServiceId('');
    setClientPreferences('');
    setCustomerPhone('');
    setBookingStep(1);
    setView('booking');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === 'dom valim' && loginPass === 'dom valim') {
      setIsAdmin(true);
      setView('admin');
      setLoginError('');
      setLoginUser('');
      setLoginPass('');
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleForgotPassword = () => {
    // Redireciona para o WhatsApp do dono com mensagem pré-definida
    const message = encodeURIComponent("Olá, solicito a recuperação da senha do Painel Administrativo da Barbearia Dom Vailm.");
    window.open(`https://wa.me/5547997297240?text=${message}`, '_blank');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('home');
  };

  const handleConfirmBooking = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Por favor, preencha nome e telefone.");
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      date: selectedDate,
      time: selectedTime,
      serviceId: selectedServiceId,
      createdAt: Date.now(),
      status: 'SCHEDULED',
      paymentMethod: 'PENDING',
      clientPreferences
    };

    Storage.saveAppointment(newAppointment);
    setAppointments([...appointments, newAppointment]);
    
    sendNotification(
      "Agendamento Confirmado!", 
      `Olá ${customerName}, seu horário na Dom Vailm foi marcado para ${selectedDate.split('-').reverse().join('/')} às ${selectedTime}.`
    );

    setView('success');
  };

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus, paymentMethod: PaymentMethod = 'PENDING') => {
    const app = appointments.find(a => a.id === id);
    if (app) {
       // If cancelling, confirm
       if (newStatus === 'CANCELLED' && !window.confirm("Deseja realmente cancelar este agendamento?")) return;

       const updated = { ...app, status: newStatus, paymentMethod };
       Storage.updateAppointment(updated);
       setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseDesc || !newExpenseAmount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpenseDesc,
      amount: parseFloat(newExpenseAmount),
      date: new Date().toISOString().split('T')[0],
      category: 'Manual'
    };

    Storage.saveExpense(expense);
    setExpenses([...expenses, expense]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    Storage.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateNote = (id: string) => {
     const app = appointments.find(a => a.id === id);
     if (app) {
       const updated = { ...app, barberNotes: tempNote };
       Storage.updateAppointment(updated);
       setAppointments(prev => prev.map(a => a.id === id ? updated : a));
       setEditingNoteId(null);
     }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}, aqui é da Barbearia Dom Vailm.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Serviço';
  const getServiceType = (id: string) => SERVICES.find(s => s.id === id)?.type || '';
  const getServicePrice = (id: string) => SERVICES.find(s => s.id === id)?.price || 0;

  // --- Views ---

  const renderLogin = () => (
    <div className="flex flex-col min-h-[70vh] items-center justify-center px-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6 text-amber-500">
          <Lock size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Acesso do Barbeiro</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Usuário</label>
            <input 
              type="text" 
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Senha</label>
            <input 
              type="password" 
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
            />
          </div>
          
          <div className="flex justify-end pt-1">
             <button 
               type="button" 
               onClick={handleForgotPassword}
               className="text-xs text-zinc-500 hover:text-amber-500 transition-colors hover:underline"
             >
               Esqueceu a senha?
             </button>
          </div>

          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
          <Button fullWidth type="submit">Entrar</Button>
        </form>
        <button onClick={() => setView('home')} className="w-full text-center mt-4 text-zinc-500 text-sm hover:text-zinc-300">
          Voltar
        </button>
      </div>
    </div>
  );

  const renderAdminAgenda = () => {
    // Navigate days
    const changeDay = (offset: number) => {
        const d = new Date(adminDate);
        d.setDate(d.getDate() + offset);
        setAdminDate(d.toISOString().split('T')[0]);
    };

    // Filter Logic
    let filteredApps = appointments.filter(a => a.date === adminDate);
    
    if (filterStatus !== 'ALL') {
      filteredApps = filteredApps.filter(a => a.status === filterStatus);
    }
    if (filterServiceType !== 'ALL') {
      filteredApps = filteredApps.filter(a => getServiceType(a.serviceId) === filterServiceType);
    }

    // Sort by time
    filteredApps.sort((a, b) => a.time.localeCompare(b.time));

    const totalScheduled = filteredApps.filter(a => a.status === 'SCHEDULED').length;

    return (
      <div className="space-y-4 animate-in slide-in-from-right">
        {/* Date Nav */}
        <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
          <button onClick={() => changeDay(-1)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <ChevronLeft />
          </button>
          <div className="text-center">
             <span className="text-xs text-zinc-500 uppercase font-bold block">Agenda</span>
             <span className="text-white font-bold">{adminDate.split('-').reverse().join('/')}</span>
          </div>
          <button onClick={() => changeDay(1)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <ChevronRight />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value as any)}
             className="bg-zinc-900 text-sm text-zinc-300 border border-zinc-800 rounded-lg p-2 outline-none focus:border-amber-500"
           >
             <option value="ALL">Todos Status</option>
             <option value="SCHEDULED">Agendados</option>
             <option value="COMPLETED">Concluídos</option>
             <option value="CANCELLED">Cancelados</option>
           </select>

           <select 
             value={filterServiceType} 
             onChange={(e) => setFilterServiceType(e.target.value)}
             className="bg-zinc-900 text-sm text-zinc-300 border border-zinc-800 rounded-lg p-2 outline-none focus:border-amber-500"
           >
             <option value="ALL">Todos Serviços</option>
             <option value="HAIRCUT">Cortes</option>
             <option value="BEARD">Barba</option>
             <option value="COMBO">Combos</option>
           </select>
        </div>

        {/* Stats */}
        <div className="text-xs text-zinc-500 px-1">
           Mostrando {filteredApps.length} agendamento(s). {totalScheduled} pendente(s).
        </div>

        {/* List */}
        <div className="space-y-4 pb-20">
          {filteredApps.length === 0 ? (
            <div className="text-center py-10 text-zinc-600 border border-zinc-800 border-dashed rounded-xl">
              Agenda vazia para este filtro.
            </div>
          ) : (
            filteredApps.map(app => {
               const isEditing = editingNoteId === app.id;
               const price = getServicePrice(app.serviceId);

               return (
                 <div key={app.id} className={`bg-zinc-900 border rounded-xl p-4 shadow-lg relative overflow-hidden transition-colors ${app.status === 'CANCELLED' ? 'border-red-900/30 opacity-75' : app.status === 'COMPLETED' ? 'border-green-900/30' : 'border-zinc-700'}`}>
                   {/* Status Stripe */}
                   <div className={`absolute top-0 left-0 w-1 h-full ${app.status === 'CANCELLED' ? 'bg-red-500' : app.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`}></div>

                   <div className="flex justify-between items-start mb-3 pl-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-lg">{app.time}</span>
                          <span className="text-amber-500 font-semibold text-sm truncate max-w-[140px]">{app.customerName}</span>
                        </div>
                        <div className="text-zinc-400 text-xs mt-1">
                          {getServiceName(app.serviceId)} - <span className="text-green-400 font-bold">R$ {price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => openWhatsApp(app.customerPhone, app.customerName)}
                           className="p-2 bg-zinc-800 text-green-500 rounded-lg hover:bg-zinc-700"
                         >
                           <MessageSquare size={18} />
                         </button>
                      </div>
                   </div>

                   {/* Actions Row */}
                   {app.status === 'SCHEDULED' && (
                     <div className="pl-3 mb-3 flex gap-2">
                        <button 
                          onClick={() => {
                            const method = window.prompt("Forma de Pagamento? (pix, dinheiro, cartao)");
                            if (method) {
                               let pm: PaymentMethod = 'CASH';
                               if (method.toLowerCase().includes('pix')) pm = 'PIX';
                               if (method.toLowerCase().includes('cart')) pm = 'CARD';
                               handleUpdateStatus(app.id, 'COMPLETED', pm);
                            }
                          }}
                          className="flex-1 bg-green-600/20 text-green-500 py-2 rounded text-xs font-bold hover:bg-green-600/30 flex items-center justify-center gap-1"
                        >
                           <CheckCircle2 size={14} /> Concluir
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          className="flex-1 bg-red-600/20 text-red-500 py-2 rounded text-xs font-bold hover:bg-red-600/30 flex items-center justify-center gap-1"
                        >
                           <X size={14} /> Cancelar
                        </button>
                     </div>
                   )}

                   {/* Status Badge if not Scheduled */}
                   {app.status !== 'SCHEDULED' && (
                      <div className="pl-3 mb-3 flex gap-2">
                         <span className={`text-xs font-bold px-2 py-1 rounded ${app.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                           {app.status === 'COMPLETED' ? `Concluído (${app.paymentMethod === 'CARD' ? 'Cartão' : app.paymentMethod === 'PIX' ? 'Pix' : 'Dinheiro'})` : 'Cancelado'}
                         </span>
                      </div>
                   )}

                   {/* Notes Section */}
                   <div className="pl-3 border-t border-zinc-800 pt-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                         <Phone size={12} /> {app.customerPhone}
                      </div>
                      
                      {app.clientPreferences && (
                        <div className="mb-3 text-xs bg-black/30 p-2 rounded text-zinc-300 italic border border-zinc-800">
                          "{app.clientPreferences}"
                        </div>
                      )}

                      {isEditing ? (
                        <div className="mt-2 animate-in fade-in">
                          <textarea 
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            className="w-full bg-black/40 border border-zinc-700 rounded p-2 text-sm text-white mb-2"
                            placeholder="Registre o que foi feito..."
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                             <button onClick={() => setEditingNoteId(null)} className="text-xs text-zinc-400 px-3 py-1">Cancelar</button>
                             <button 
                               onClick={() => handleUpdateNote(app.id)}
                               className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-500"
                             >
                               Salvar
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingNoteId(app.id);
                            setTempNote(app.barberNotes || '');
                          }}
                          className="group cursor-pointer mt-2"
                        >
                           <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 group-hover:text-amber-500 transition-colors">
                             <span className="font-bold uppercase tracking-wider">Histórico / Notas</span>
                             <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <p className="text-sm text-zinc-400 bg-zinc-800/50 p-2 rounded border border-transparent group-hover:border-zinc-700 min-h-[2rem]">
                             {app.barberNotes || "Clique para adicionar notas..."}
                           </p>
                        </div>
                      )}
                   </div>
                 </div>
               );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAdminFinance = () => {
     // Calculate Totals based on ALL time (or filter by month? Let's do all time for simplicity for now, or current month)
     // Let's do Current Month for relevance
     const currentMonth = new Date().getMonth();
     const currentYear = new Date().getFullYear();

     const monthlyApps = appointments.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && a.status === 'COMPLETED';
     });

     const monthlyExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
     });

     const totalRevenue = monthlyApps.reduce((sum, app) => sum + getServicePrice(app.serviceId), 0);
     const totalCost = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
     const profit = totalRevenue - totalCost;

     // Chart Data (Simple CSS bars)
     const maxVal = Math.max(totalRevenue, totalCost) || 1;
     const revHeight = (totalRevenue / maxVal) * 100;
     const costHeight = (totalCost / maxVal) * 100;

     return (
       <div className="space-y-6 animate-in slide-in-from-right pb-20">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
             <h3 className="text-zinc-500 text-sm font-bold uppercase mb-4">Resumo do Mês</h3>
             
             {/* Chart */}
             <div className="flex items-end justify-center gap-8 h-40 mb-6 border-b border-zinc-800 pb-2">
                <div className="flex flex-col items-center gap-2 group w-16">
                   <span className="text-xs text-green-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">R$ {totalRevenue}</span>
                   <div style={{ height: `${revHeight}%` }} className="w-full bg-green-500/80 rounded-t-lg transition-all duration-500 min-h-[4px]"></div>
                   <span className="text-xs text-zinc-400">Entradas</span>
                </div>
                <div className="flex flex-col items-center gap-2 group w-16">
                   <span className="text-xs text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">R$ {totalCost}</span>
                   <div style={{ height: `${costHeight}%` }} className="w-full bg-red-500/80 rounded-t-lg transition-all duration-500 min-h-[4px]"></div>
                   <span className="text-xs text-zinc-400">Saídas</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                 <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><TrendingUp size={12}/> Receita</div>
                 <div className="text-green-500 font-bold text-xl">R$ {totalRevenue.toFixed(2)}</div>
               </div>
               <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                 <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><TrendingDown size={12}/> Despesas</div>
                 <div className="text-red-500 font-bold text-xl">R$ {totalCost.toFixed(2)}</div>
               </div>
             </div>
             
             <div className="mt-4 bg-zinc-800/50 p-4 rounded-xl flex justify-between items-center border border-zinc-700">
                <span className="font-bold text-zinc-300">Lucro Líquido</span>
                <span className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {profit.toFixed(2)}
                </span>
             </div>
          </div>

          {/* Add Expense */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
             <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <PlusCircle size={16} className="text-amber-500" /> Adicionar Gasto
             </h4>
             <form onSubmit={handleAddExpense} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Descrição (ex: Luz)" 
                  value={newExpenseDesc}
                  onChange={e => setNewExpenseDesc(e.target.value)}
                  className="flex-1 bg-black/40 border border-zinc-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Valor" 
                  value={newExpenseAmount}
                  onChange={e => setNewExpenseAmount(e.target.value)}
                  className="w-24 bg-black/40 border border-zinc-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                />
                <button type="submit" className="bg-amber-600 text-white p-2 rounded hover:bg-amber-500">
                   <PlusCircle size={20} />
                </button>
             </form>
          </div>

          {/* Expense List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
             <h4 className="font-bold text-zinc-400 text-xs uppercase mb-3">Histórico de Gastos</h4>
             <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {monthlyExpenses.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-2">Nenhum gasto registrado.</p>
                ) : (
                  monthlyExpenses.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center bg-zinc-800/30 p-2 rounded border border-zinc-800">
                       <div>
                         <div className="text-white text-sm font-medium">{exp.description}</div>
                         <div className="text-zinc-500 text-xs">{exp.date.split('-').reverse().join('/')}</div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-red-400 font-bold">R$ {exp.amount.toFixed(2)}</span>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="text-zinc-600 hover:text-red-500">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
       </div>
     );
  };

  const renderAdmin = () => (
    <div className="animate-in fade-in">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="text-amber-500" size={20}/> Painel Dono
          </h2>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm">
            <LogOut size={16} /> Sair
          </button>
       </div>

       {/* Tabs */}
       <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
          <button 
            onClick={() => setAdminTab('agenda')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${adminTab === 'agenda' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Calendar size={16} /> Agenda
          </button>
          <button 
            onClick={() => setAdminTab('finance')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${adminTab === 'finance' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <DollarSign size={16} /> Financeiro
          </button>
       </div>

       {adminTab === 'agenda' ? renderAdminAgenda() : renderAdminFinance()}
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col min-h-screen pt-20 pb-10 px-4 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 mb-12">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-4 animate-pulse">
           <Scissors className="text-amber-500 w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Estilo que <br/>
          <span className="text-amber-500">Impõe Respeito</span>
        </h1>
        
        <p className="text-zinc-400 text-lg leading-relaxed">
          Bem-vindo a <strong>DOM VAILM</strong>. <br/>
          Agende seu horário com facilidade e venha renovar o visual.
        </p>
        
        <div className="w-full pt-4 space-y-3">
          <Button fullWidth onClick={handleStartBooking} className="text-lg py-4">
            Agendar Horário
          </Button>
          <Button fullWidth variant="outline" onClick={() => setView('promotions')}>
            Ver Promoções e Novidades
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-amber-500" /> 
          Localização
        </h3>
        <p className="text-zinc-400 text-sm">
          Rua das Barbearias, 123 - Centro<br/>
          (Pagamento somente presencial)
        </p>
      </div>
    </div>
  );

  // --- Reused Render Functions from previous context (Booking, Success, etc) ---
  // Keeping them consistent but accessing updated state
  
  const renderBookingStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <StepWizard step={1} title="Escolha Data e Horário" />
      <div className="space-y-3">
        <label className="text-zinc-400 text-sm font-medium">Dia</label>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {nextDays.map((day) => (
            <button
              key={day.value}
              onClick={() => {
                setSelectedDate(day.value);
                setSelectedTime('');
              }}
              className={`
                flex-shrink-0 w-24 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ease-out
                ${selectedDate === day.value 
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40 scale-105 ring-2 ring-amber-500/20' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'}
                active:scale-95
              `}
            >
              <span className="text-xs font-bold uppercase">{day.display.split(',')[0]}</span>
              <span className="text-lg font-bold">{day.display.split(' ')[1]}</span>
              <span className="text-xs opacity-70">{day.display.split(' ')[2]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-zinc-400 text-sm font-medium">Horários Disponíveis</label>
        {availableSlots.length === 0 ? (
           <div className="text-center py-8 text-zinc-500">
             Nenhum horário disponível para esta data.
           </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`
                  py-2 px-1 rounded-lg text-sm font-semibold border transition-all duration-200
                  ${!slot.available 
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed decoration-slice line-through opacity-50' 
                    : selectedTime === slot.time
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-500/30'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:scale-105'}
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pt-8">
        <Button 
          fullWidth 
          disabled={!selectedDate || !selectedTime}
          onClick={() => setBookingStep(2)}
        >
          Próximo: Escolher Serviço
        </Button>
      </div>
    </div>
  );

  const renderBookingStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setBookingStep(1)} className="p-1 -ml-2 text-zinc-400 hover:text-white"><ChevronLeft /></button>
        <StepWizard step={2} title="Selecione o Serviço" />
      </div>
      <div className="space-y-4">
        {SERVICES.map((service) => (
          <div key={service.id} onClick={() => setSelectedServiceId(service.id)} className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${selectedServiceId === service.id ? 'bg-zinc-800 border-amber-500 shadow-lg shadow-amber-900/20 scale-[1.02] ring-1 ring-amber-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 hover:scale-[1.01]'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-bold text-lg ${selectedServiceId === service.id ? 'text-amber-500' : 'text-white'}`}>{service.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{service.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} min</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xl font-bold text-white">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                {selectedServiceId === service.id && <div className="absolute top-4 right-4 bg-amber-500 rounded-full p-1 animate-in zoom-in duration-300"><CheckCircle2 size={16} className="text-white" /></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-8">
        <Button fullWidth disabled={!selectedServiceId} onClick={() => setBookingStep(3)}>Revisar e Agendar</Button>
      </div>
    </div>
  );

  const renderBookingStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setBookingStep(2)} className="p-1 -ml-2 text-zinc-400 hover:text-white"><ChevronLeft /></button>
        <StepWizard step={3} title="Confirmação" />
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-zinc-800 pb-4">
          <label className="text-xs uppercase tracking-wide text-zinc-500 font-bold block mb-1">Data e Hora</label>
          <div className="flex items-center gap-2 text-white text-lg font-semibold"><Calendar size={18} className="text-amber-500" /> {selectedDate.split('-').reverse().join('/')} às {selectedTime}</div>
        </div>
        <div className="border-b border-zinc-800 pb-4">
          <label className="text-xs uppercase tracking-wide text-zinc-500 font-bold block mb-1">Serviço</label>
          <div className="flex items-center justify-between"><span className="text-white text-lg font-medium">{getServiceName(selectedServiceId)}</span><span className="text-amber-500 font-bold">R$ {getServicePrice(selectedServiceId).toFixed(2).replace('.', ',')}</span></div>
        </div>
        <div className="border-b border-zinc-800 pb-4">
          <label className="text-xs uppercase tracking-wide text-zinc-500 font-bold block mb-2">Preferências / Observações</label>
          <textarea value={clientPreferences} onChange={(e) => setClientPreferences(e.target.value)} placeholder="Ex: Disfarce baixo..." className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors text-sm h-20 resize-none" />
        </div>
        <div className="space-y-3">
           <div>
            <label className="text-xs uppercase tracking-wide text-zinc-500 font-bold block mb-2">Seu Nome</label>
            <input type="text" placeholder="Como podemos te chamar?" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-zinc-500 font-bold block mb-2">Seu WhatsApp</label>
            <input type="tel" placeholder="(00) 00000-0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
        </div>
      </div>
      <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-4 flex gap-3 items-start">
        <div className="mt-1"><MapPin size={18} className="text-amber-500" /></div>
        <div><h4 className="font-bold text-amber-500 text-sm">Pagamento Presencial</h4><p className="text-zinc-400 text-xs mt-1">O pagamento deve ser realizado diretamente no balcão após o serviço. Aceitamos dinheiro, PIX e cartões.</p></div>
      </div>
      <div className="pt-4"><Button fullWidth onClick={handleConfirmBooking}>Confirmar Agendamento</Button></div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
      <h2 className="text-3xl font-bold text-white mb-2">Agendado!</h2>
      <p className="text-zinc-400 mb-8 max-w-xs">Te esperamos na Dom Vailm, {customerName}. <br/> Data: {selectedDate.split('-').reverse().join('/')} às {selectedTime}.</p>
      <div className="bg-zinc-800/50 p-4 rounded-lg mb-8 text-sm text-zinc-300 border border-zinc-700"><div className="flex items-center gap-2 justify-center mb-1 text-amber-500 font-semibold"><Bell size={16} /> Notificação Ativada</div>Você receberá um lembrete 24h antes.</div>
      <div className="space-y-3 w-full"><Button fullWidth onClick={() => setView('my-appointments')}>Ver Meus Agendamentos</Button><Button fullWidth variant="secondary" onClick={() => { setView('home'); setCustomerName(''); setCustomerPhone(''); }}>Voltar ao Início</Button></div>
    </div>
  );

  const renderMyAppointments = () => {
    const allApps = [...appointments].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    const now = new Date();
    const upcoming = allApps.filter(a => new Date(`${a.date}T${a.time}`) >= now && a.status !== 'CANCELLED');
    const history = allApps.filter(a => new Date(`${a.date}T${a.time}`) < now || a.status !== 'SCHEDULED').reverse();

    return (
      <div className="animate-in slide-in-from-bottom duration-300 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="text-amber-500" /> Próximos</h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed"><p className="text-zinc-500">Nenhum agendamento futuro.</p><button onClick={() => handleStartBooking()} className="text-amber-500 font-semibold mt-2 hover:underline">Agendar agora</button></div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((app) => (
                <div key={app.id} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl flex flex-col gap-3 shadow-lg shadow-black/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="font-bold text-white text-lg">{app.time}</span><span className="text-zinc-500 text-sm font-medium">{app.date.split('-').reverse().join('/')}</span></div>
                      <h4 className="text-amber-500 font-semibold">{getServiceName(app.serviceId)}</h4>
                      <p className="text-zinc-400 text-sm">Cliente: {app.customerName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-3 border-t border-zinc-800">
                      <button onClick={() => handleUpdateStatus(app.id, 'CANCELLED')} className="flex-1 text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"><X size={16} /> Desmarcar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-zinc-500" /> Histórico</h2>
          {history.length === 0 ? <p className="text-zinc-600 text-sm">Nenhum histórico disponível.</p> : (
            <div className="space-y-4">
              {history.map((app) => (
                 <div key={app.id} className={`bg-zinc-900/30 border p-4 rounded-xl transition-opacity ${app.status === 'CANCELLED' ? 'border-red-900/30 opacity-60' : 'border-zinc-800 opacity-80'}`}>
                    <div className="flex justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-bold">{app.date.split('-').reverse().join('/')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${app.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                          {app.status === 'CANCELLED' ? 'Cancelado' : 'Concluído'}
                        </span>
                    </div>
                    <h4 className="text-zinc-300 font-semibold">{getServiceName(app.serviceId)}</h4>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromotions = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setView('home')} className="p-1 -ml-2 text-zinc-400 hover:text-white"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold text-white">Novidades & Promoções</h2>
      </div>
      <div className="space-y-4">
        {PROMOTIONS.map((promo) => (
          <div key={promo.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
            <div className={`h-2 w-full ${promo.type === 'PROMO' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${promo.type === 'PROMO' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>{promo.type === 'PROMO' ? 'Oferta' : 'Notícia'}</span>
                {promo.validUntil && <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock size={12}/> Válido até {promo.validUntil.split('-').reverse().join('/')}</span>}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{promo.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-950 min-h-screen font-sans selection:bg-amber-500/30">
      <Header onViewChange={setView} currentView={view} isLoggedIn={isAdmin} />
      
      <main className="max-w-md mx-auto pt-24 px-4 pb-10">
        {view === 'home' && renderHome()}
        {view === 'admin' && isAdmin && renderAdmin()}
        {view === 'login' && renderLogin()}
        {view === 'promotions' && renderPromotions()}
        {view === 'booking' && (
          <>
            {bookingStep === 1 && renderBookingStep1()}
            {bookingStep === 2 && renderBookingStep2()}
            {bookingStep === 3 && renderBookingStep3()}
          </>
        )}
        {view === 'success' && renderSuccess()}
        {view === 'my-appointments' && renderMyAppointments()}
      </main>
    </div>
  );
}