import { NextResponse } from 'next/server';

const AIRBNB_ICAL_URL = 'https://www.airbnb.com.br/calendar/ical/1400169773928514039.ics?t=093461f8b90b4b17886153abaab62216';

export async function GET() {
  try {
    // Buscar o arquivo iCal do Airbnb
    const response = await fetch(AIRBNB_ICAL_URL, {
      cache: 'no-store', // Sempre buscar dados atualizados
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar calendário do Airbnb');
    }

    const icalData = await response.text();
    
    // Parsear o iCal manualmente (simples parser)
    const unavailableDates: string[] = [];
    const events = icalData.split('BEGIN:VEVENT');
    
    events.slice(1).forEach((event) => {
      // Extrair DTSTART e DTEND
      const dtStartMatch = event.match(/DTSTART[;:].*?:(\d{8})/);
      const dtEndMatch = event.match(/DTEND[;:].*?:(\d{8})/);
      
      if (dtStartMatch && dtEndMatch) {
        const startDate = dtStartMatch[1];
        const endDate = dtEndMatch[1];
        
        // Converter YYYYMMDD para YYYY-MM-DD
        const start = new Date(
          parseInt(startDate.substring(0, 4)),
          parseInt(startDate.substring(4, 6)) - 1,
          parseInt(startDate.substring(6, 8))
        );
        
        const end = new Date(
          parseInt(endDate.substring(0, 4)),
          parseInt(endDate.substring(4, 6)) - 1,
          parseInt(endDate.substring(6, 8))
        );
        
        // Adicionar todas as datas entre start e end
        const currentDate = new Date(start);
        while (currentDate < end) {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          unavailableDates.push(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    return NextResponse.json({ 
      unavailableDates: [...new Set(unavailableDates)], // Remover duplicatas
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao processar calendário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar disponibilidade' },
      { status: 500 }
    );
  }
}
