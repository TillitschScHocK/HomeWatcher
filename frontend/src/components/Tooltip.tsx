import { Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
}

export function Tooltip({ content }: TooltipProps) {
  return (
    <div className="group relative inline-flex items-center">
      <Info className="w-4 h-4 text-blue-400 cursor-help" />
      <div className="absolute left-0 bottom-full mb-2 w-96 bg-gray-900 p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {content}
        <div className="absolute left-1 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
}

export const ModeTooltipContent = () => (
  <div className="space-y-3 text-sm">
    <div>
      <span className="font-semibold text-blue-400">Direct</span>
      <p>Verwendet den Quell-Stream direkt. Funktioniert bei den meisten Streams nicht aufgrund von CORS, IP-/Geräteeinschränkungen. Ist auch inkompatibel mit benutzerdefinierten Headern und Privatsphären-Modus.</p>
    </div>
    <div>
      <span className="font-semibold text-blue-400">Proxy</span>
      <p>Die Stream-Anfragen werden über das Backend geleitet. Ermöglicht das Setzen benutzerdefinierter Header und Umgehung von CORS. Dieser Modus wird bevorzugt. Wechsle nur zum Restream-Modus, wenn der Proxy-Modus für deinen Stream nicht funktioniert oder du Synchronisationsprobleme hast.</p>
    </div>
    <div>
      <span className="font-semibold text-blue-400">Restream</span>
      <p>Der Backend-Dienst cached den Quell-Stream (mit ffmpeg) und streamt ihn erneut. Kann bei strengen Geräteeinschränkungen deines Anbieters helfen. Kann aber zu langen anfänglichen Ladezeiten und mit der Zeit zu Leistungsproblemen führen.</p>
    </div>
  </div>
);