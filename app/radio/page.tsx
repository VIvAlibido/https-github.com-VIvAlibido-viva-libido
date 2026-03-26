'use client';

import { useState, useEffect } from 'react';
import { RadioBulletin, RadioTimeSlot, Language } from '@/lib/types';
import LanguageTabs from '../components/LanguageTabs';
import RadioBulletinCard from '../components/RadioBulletinCard';
import CopyButton from '../components/CopyButton';

export default function RadioPage() {
  const [bulletins, setBulletins] = useState<RadioBulletin[]>([]);
  const [timeSlots, setTimeSlots] = useState<RadioTimeSlot[]>([]);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/radio?date=${today}`);
      const data = await res.json();
      setBulletins(data.bulletins || []);
      setTimeSlots(data.timeSlots || []);
      if (data.timeSlots?.length > 0) {
        setActiveSlot(data.timeSlots[data.timeSlots.length - 1].timeSlot);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const refreshBulletins = async () => {
    setUpdating(true);
    setUpdateStatus('Nieuwe bulletins genereren met laatste nieuws...');
    try {
      const res = await fetch('/api/radio-update', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'complete') {
        setUpdateStatus(`Klaar! ${data.bulletins} bulletins voor ${data.timeSlot} (${data.totalTimeSlots} updates vandaag)`);
        loadData();
      } else {
        setUpdateStatus(`Fout: ${data.error}`);
      }
    } catch (err) {
      setUpdateStatus(`Mislukt: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Show bulletins from active time slot, or latest bulletins
  const displayBulletins = activeSlot && timeSlots.length > 0
    ? timeSlots.find(s => s.timeSlot === activeSlot)?.bulletins || bulletins
    : bulletins;

  const filtered = displayBulletins.filter(b => b.language === language);
  const intro = filtered[0]?.intro || '';
  const outro = filtered[0]?.outro || '';

  const fullScript = [
    intro,
    ...filtered.map(b => b.text),
    outro,
  ].filter(Boolean).join('\n\n');

  const totalWords = filtered.reduce((sum, b) => sum + b.wordCount, 0);
  const totalSeconds = filtered.reduce((sum, b) => sum + b.estimatedSeconds, 0);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Radio Bulletins</h1>
            <p className="text-gray-500 mt-1">2-minuten nieuwsbulletin voor Ibiza radio — elke 3 uur vernieuwd</p>
          </div>
          <button
            onClick={refreshBulletins}
            disabled={updating}
            className={`px-5 py-2.5 rounded-lg font-medium text-white transition-colors ${
              updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {updating ? 'Bezig...' : 'Vernieuw Bulletins'}
          </button>
        </div>
        {updateStatus && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            updateStatus.startsWith('Klaar') ? 'bg-green-50 text-green-700' :
            updateStatus.startsWith('Fout') || updateStatus.startsWith('Mislukt') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {updateStatus}
          </div>
        )}
      </div>

      {/* Time Slot Selector */}
      {timeSlots.length > 1 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Tijdslot:</p>
          <div className="flex gap-2 flex-wrap">
            {timeSlots.map(slot => (
              <button
                key={slot.timeSlot}
                onClick={() => setActiveSlot(slot.timeSlot)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSlot === slot.timeSlot
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {slot.timeSlot}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <LanguageTabs active={language} onChange={setLanguage} />
        {filtered.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {totalWords} woorden | ~{totalSeconds}s totaal
            </span>
            <CopyButton text={fullScript} label="Kopieer Volledig Script" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nog geen radio bulletins</p>
          <p className="text-sm mt-1">Start eerst de pipeline via het Dashboard</p>
        </div>
      ) : (
        <div className="space-y-4">
          {intro && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-semibold text-sm">INTRO</span>
                <CopyButton text={intro} />
              </div>
              <p className="text-blue-800 text-sm">{intro}</p>
            </div>
          )}

          {filtered.map(bulletin => (
            <RadioBulletinCard
              key={`${bulletin.bulletinNumber}-${bulletin.language}`}
              bulletin={bulletin}
            />
          ))}

          {outro && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-semibold text-sm">OUTRO</span>
                <CopyButton text={outro} />
              </div>
              <p className="text-blue-800 text-sm">{outro}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
