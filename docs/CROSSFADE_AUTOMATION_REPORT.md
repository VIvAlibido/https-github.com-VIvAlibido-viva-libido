# Hearty Radio Automation — Harmonische Crossfade Systeem

## Onderzoeksverslag: Radio Automation Software & Crossfade Technologie

---

## 1. Hoe Professionele Radio Automation Werkt

### Industriestandaard Systemen

Professionele radiostations gebruiken automation software die de gehele
uitzending aanstuurt: muziekplanning, jingles, reclame, en overgangen.

**Commerciële systemen:**
- **RCS Zetta / Selector**: Marktleider. Selector plant muziek op basis van
  rotatie, tempo, stemming en flow-regels. Zetta voert de playlist uit en
  beheert overgangen via vooraf ingestelde intro/outro markers.
- **WideOrbit Automation**: Gebruikt "segue editor" waar producers handmatig
  crossfade-punten instellen per track-paar.
- **iHeartMedia**: Gebruikt eigen automation stack op basis van RCS, met
  AI-aangedreven flow-optimalisatie voor 850+ stations.
- **ENCO DAD**: Real-time automation met frame-accurate crossfades.

### Hoe Crossfades Traditioneel Werken

Traditionele radio automation gebruikt **vaste markers** per track:

```
Track metadata:
  - Intro time: 4.2s (instrumentaal begin)
  - Segue point: 3:28.5 (waar fade-out begint)
  - Outro type: fade / cold-end
  - Hook: 0:45-1:15
```

De automation software start Track B op het **segue-punt** van Track A.
De overlap is: `track_A.duration - track_A.segue_point + track_B.intro_time`.

**Beperking**: Dit is per-track geconfigureerd, niet per track-PAAR. Elke
overgang klinkt hetzelfde ongeacht welke tracks op elkaar volgen.

---

## 2. Hearty's Aanpak: Intelligente Per-Paar Crossfade

Hearty gaat verder dan traditionele radio automation door de crossfade
**dynamisch per track-paar** te berekenen op basis van muzikale compatibiliteit.

### Architectuur

```
┌─────────────────┐     GET /get_next      ┌──────────────────────┐
│   Liquidsoap    │ ──────────────────────→ │  server_cocktail.py  │
│   (playout)     │                         │                      │
│                 │ ←────────────────────── │  crossfade_engine.py │
│                 │   annotate:liq_cross..  │  (BPM + Key analyse) │
└─────────────────┘                         └──────────────────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────────┐
                                            │   tracks database    │
                                            │   (BPM, Key, etc.)   │
                                            └──────────────────────┘
```

**Belangrijke design-keuze**: Geen Liquidsoap wijzigingen nodig. Alle
intelligentie zit server-side. Liquidsoap respecteert de annotaties die de
server meegeeft.

### Liquidsoap Annotaties

Liquidsoap ondersteunt per-track metadata via `annotate:` URIs:

| Annotatie | Functie |
|---|---|
| `liq_cross_duration` | Overlap duur in seconden — hoe lang beide tracks tegelijk spelen |
| `liq_fade_out` | Fade-out duur van de uitgaande track (Track A) |
| `liq_fade_in` | Fade-in duur van de inkomende track (Track B) — **altijd 0** |
| `liq_cue_in` | Skip begin van track (in seconden) |
| `liq_cue_out` | Stop track vroeger (in seconden voor einde) |

Voorbeeld annotatie URI:
```
annotate:liq_cross_duration="8.0",liq_fade_out="8.0",liq_fade_in="0.0":/music/track.mp3
```

---

## 3. Harmonische Mixing: Het Camelot Wheel

### Wat is het Camelot Wheel?

Het Camelot Wheel is een circulair systeem dat muzikale toonsoorten
rangschikt op harmonie-compatibiliteit. Elke toonsoort krijgt een code:
nummer (1-12) + letter (A=mineur, B=majeur).

```
        12B
    11B     1B
  10B         2B
 9B             3B        B = Majeur
  8B          4B
    7B      5B
        6B

        12A
    11A     1A
  10A         2A
 9A             3A        A = Mineur
  8A          4A
    7A      5A
        6A
```

### Mixing Regels

| Afstand | Compatibiliteit | Voorbeeld |
|---|---|---|
| 0 | Perfect — zelfde toonsoort | 8A → 8A |
| 1 | Perfect — buur of relatief majeur/mineur | 8A → 9A, 8A → 8B |
| 2-3 | Goed — professionele radio-kwaliteit | 8A → 10A |
| 4-5 | Acceptabel — merkbaar maar niet storend | 8A → 12A |
| 6 | Clash — dissonant, snelle cut nodig | 8A → 2B |

### BPM Compatibiliteit

Tempo-verschil bepaalt hoeveel je kunt blenden:

| BPM verschil | Effect | Actie |
|---|---|---|
| ≤6% | Onmerkbaar | Volle blend mogelijk |
| 6-12% | Merkbaar bij lang blend | Max 2 bars overlap |
| >12% | Duidelijk hoorbaar | Max 1 bar, snelle cut |

---

## 4. De Crossfade Beslissingsmatrix

Hearty's `crossfade_engine.py` combineert key + BPM in één beslissing:

```
                    BPM Match (≤6%)    BPM OK (6-12%)   BPM Clash (>12%)
                   ┌──────────────────┬─────────────────┬─────────────────┐
Key Perfect (0-1)  │ 8 bars (~16s)    │ 2 bars (~4s)    │ 1 bar (~2s)     │
                   │ Naadloze blend    │ Korte blend     │ Snelle cut      │
                   ├──────────────────┼─────────────────┼─────────────────┤
Key Good (2-3)     │ 4 bars (~8s)     │ 2 bars (~4s)    │ 1 bar (~2s)     │
                   │ Pro radio blend   │ Korte blend     │ Snelle cut      │
                   ├──────────────────┼─────────────────┼─────────────────┤
Key OK (4-5)       │ 2 bars (~4s)     │ 2 bars (~4s)    │ 1 bar (~2s)     │
                   │ Korte crossfade   │ Korte crossfade │ Snelle cut      │
                   ├──────────────────┼─────────────────┼─────────────────┤
Key Clash (6)      │ 0.5 bar (~1s)    │ 0.5 bar (~1s)   │ 0.5 bar (~1s)   │
                   │ Intentionele cut  │ Intentionele cut│ Intentionele cut│
                   └──────────────────┴─────────────────┴─────────────────┘
```

*(Tijden bij 120 BPM; bij andere tempos schaalt het proportioneel)*

---

## 5. Beat/Bar Grid Snapping

### Waarom Snapping?

Een crossfade die halverwege een beat begint of eindigt klinkt "off" — alsof
de DJ een fout maakt. Door de overlap te snappen naar bar- of beat-boundaries
klinkt elke overgang muzikaal correct.

### Hoe het werkt

```python
snap_to_beat(overlap_ms, bpm):
    # Lange overlaps → snap naar bars (4 beats)
    # Korte overlaps → snap naar beats
    # Altijd minimaal 1 beat
```

Voorbeeld bij 128 BPM:
- 1 beat = 469ms
- 1 bar = 1875ms
- Gevraagd: 3500ms → gesnapt: 3750ms (2 bars)
- Gevraagd: 800ms → gesnapt: 938ms (2 beats)

---

## 6. Vergelijking met Andere Systemen

| Feature | Traditionele Radio | Hearty | Live DJ |
|---|---|---|---|
| Per-track crossfade | ✅ Vast per track | ✅ Dynamisch per paar | ✅ Handmatig |
| Key-aware mixing | ❌ | ✅ Camelot distance | ✅ |
| BPM-aware mixing | ❌ | ✅ Tempo penalty | ✅ Beatmatching |
| Beat-grid aligned | ❌ | ✅ Bar/beat snap | ✅ Realtime |
| Realtime beatgrid | ❌ | ❌ | ✅ |
| EQ transitions | ❌ | ❌ | ✅ |
| Live aanpassing | ❌ | ❌ | ✅ |

**Conclusie**: Hearty's systeem benadert live DJ-kwaliteit voor geautomatiseerde
radio. Het verschil met een live DJ is vooral het ontbreken van realtime
beatgrid-synchronisatie en EQ-manipulation, maar voor radio automation is dit
aanzienlijk beter dan de industrie-standaard.

---

## 7. Technische Implementatie

### Bestanden

| Bestand | Rol |
|---|---|
| `vps/crossfade_engine.py` | Gedeelde module: Camelot, BPM, snap, crossfade berekening |
| `vps/server_cocktail.py` | Cocktail kanaal server met `/get_next` endpoint |
| `vps/server_melodica.py` | Melodica kanaal server |
| `vps/server.py` | Hoofd server |
| `vps/test_crossfade_engine.py` | 22 unit tests (allemaal groen) |
| `lib/beat-utils.ts` | Frontend utilities (TypeScript mirror van engine) |

### API Response Voorbeeld

```json
{
  "id": 42,
  "title": "Midnight City",
  "artist": "M83",
  "filepath": "/music/m83-midnight-city.mp3",
  "annotate_uri": "annotate:liq_cross_duration=\"8.0\",liq_fade_out=\"8.0\",liq_fade_in=\"0.0\":/music/m83-midnight-city.mp3",
  "bpm": 105,
  "key": "10B",
  "annotations": {
    "liq_cross_duration": "8.0",
    "liq_fade_out": "8.0",
    "liq_fade_in": "0.0"
  },
  "crossfade": {
    "overlap_s": 8.0,
    "fade_out_s": 8.0,
    "fade_in_s": 0.0,
    "key_distance": 1,
    "bpm_diff_pct": 2.3,
    "avg_bpm": 106.2,
    "overlap_bars": 8
  }
}
```

### Verificatie Checklist

- [x] Skip tracks op Cocktail → logs tonen variërende overlap per key/BPM match
- [x] Perfect key match (8A→8A) → overlap ~8 bars
- [x] Key clash (1A→7B) → overlap <1s
- [x] Track B start ALTIJD op vol volume (fade_in=0)
- [x] Overgangen landen op bar/beat boundaries
- [x] 22/22 unit tests slagen

---

## 8. Toekomstige Verbeteringen

1. **Energy-based blending**: Loudness/energy analyse voor nog soepelere overgangen
2. **Cue point detection**: Automatische intro/outro detectie via ML
3. **Genre-aware mixing**: Verschillende crossfade strategieën per genre
4. **Realtime beatgrid**: Warp-based synchronisatie (complex, DJ-niveau)
