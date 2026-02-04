'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

const CONTACT_NUMBER = "5532999943917";

export const BookingCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar datas indisponíveis do Airbnb
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        if (data.unavailableDates) {
          setUnavailableDates(data.unavailableDates);
        }
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
        // Manter array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableDates();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const clickedDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (unavailableDates.includes(clickedDateStr)) return;

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: clickedDateStr, end: null });
    } else {
      if (new Date(clickedDateStr) < new Date(selectedRange.start)) {
        setSelectedRange({ start: clickedDateStr, end: selectedRange.start });
      } else {
        setSelectedRange({ ...selectedRange, end: clickedDateStr });
      }
    }
  };

  const generateWhatsAppLink = () => {
    if (!selectedRange.start) return `https://wa.me/${CONTACT_NUMBER}`;
    
    const startFmt = selectedRange.start.split('-').reverse().join('/');
    const endFmt = selectedRange.end ? selectedRange.end.split('-').reverse().join('/') : '(a definir)';
    
    const message = `Olá! Tenho interesse em alugar o Sítio Cangumbim nas datas de ${startFmt} a ${endFmt}. Poderia me passar mais informações?`;
    return `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
    const firstDay = getFirstDayOfMonth(date.getFullYear(), date.getMonth());

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isUnavailable = unavailableDates.includes(currentStr);
      const isSelected = selectedRange.start === currentStr || selectedRange.end === currentStr;
      const isInRange = selectedRange.start && selectedRange.end && currentStr > selectedRange.start && currentStr < selectedRange.end;

      let bgClass = "bg-white hover:bg-green-100 cursor-pointer text-gray-700";
      if (isUnavailable) bgClass = "bg-red-50 text-red-300 cursor-not-allowed";
      if (isSelected) bgClass = "bg-green-700 text-white hover:bg-green-800 shadow-md transform scale-105";
      if (isInRange) bgClass = "bg-green-100 text-green-800";

      days.push(
        <div 
          key={i}
          onClick={() => handleDateClick(i)}
          className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 mx-auto ${bgClass}`}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + increment);
    setDate(newDate);
  };

  return (
    <section id="reservas" className="py-20 bg-green-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Texto Call to Action */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold">Planeje seu descanso</h2>
            <p className="text-green-100 text-lg leading-relaxed">
              Consulte a disponibilidade no calendário ao lado. Selecione as datas de entrada e saída para gerar uma solicitação personalizada direto no nosso WhatsApp.
            </p>
            <div className="flex gap-4 text-sm text-green-200 pt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-full"></div>Disponível</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full opacity-50"></div>Reservado</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div>Sua Seleção</div>
            </div>
            
            {/* Display da Seleção */}
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-green-300">Check-in</p>
                  <p className="text-xl font-bold">{selectedRange.start ? selectedRange.start.split('-').reverse().join('/') : '--/--/--'}</p>
                </div>
                <ArrowRight className="text-green-300" />
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-green-300">Check-out</p>
                  <p className="text-xl font-bold">{selectedRange.end ? selectedRange.end.split('-').reverse().join('/') : '--/--/--'}</p>
                </div>
              </div>
              <Button 
                variant="whatsapp" 
                className="w-full" 
                icon={MessageCircle}
                onClick={() => window.open(generateWhatsAppLink(), '_blank')}
              >
                {selectedRange.start ? "Tenho interesse nessas datas" : "Falar no WhatsApp"}
              </Button>
            </div>
          </div>

          {/* Calendário UI */}
          <div className="lg:w-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-gray-800">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-serif capitalize">
                    {date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => changeMonth(-1)}>{'<'}</button>
                    <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => changeMonth(1)}>{'>'}</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-400 uppercase">
                  <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {renderCalendarDays()}
                </div>
                <p className="text-xs text-center text-gray-400 mt-6">
                  * Valores especiais para feriados. Consulte-nos.
                </p>
                <p className="text-xs text-center text-green-600 mt-2 font-medium">
                  ✓ Sincronizado com Airbnb
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
