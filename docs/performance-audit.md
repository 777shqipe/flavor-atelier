# Audit prestazioni e interazioni — 11 novembre 2026

Revisione partita dal checkout `75f12fa` con tre sottoagenti: animazioni/fisica, dati/interazioni e rendering delle sezioni. Gli effetti, le illustrazioni, i giochi e le transizioni restano nel progetto.

## Caricamento iniziale

Confronto tra due build di produzione dello stesso progetto, prima e dopo le modifiche. Sono contati gli asset JS/CSS referenziati dall'HTML iniziale, compresi i moduli precaricati; immagini, video, font e chunk caricati successivamente sono esclusi.

| Asset iniziali | Prima | Dopo, circa | Riduzione |
| --- | ---: | ---: | ---: |
| JavaScript | 562,9 kB | 390,7 kB | 30,6% |
| CSS | 298,2 kB | 117,9 kB | 60,5% |
| JS + CSS | 861,1 kB | 508,5 kB | 40,9% |
| JS + CSS compressi con gzip locale | 261,4 kB | 156,3 kB | 40,2% |

Queste dimensioni descrivono il lavoro necessario al primo caricamento; non sono misure di FPS, Core Web Vitals o traffico della produzione. Il DOM iniziale osservato in Chrome a 1440 × 1000 passa da 1882 a 1303 elementi.

About, Stores e il modulo contatti vengono caricati quando servono. Il gioco nel footer si prepara prima di entrare nel viewport, riservando la sua altezza originale. Leaflet e il suo CSS restano nella pagina Stores. Il bordo con le forbici è ora un modulo autonomo e non trascina nel caricamento iniziale l'intero volantino.

## Correzioni

- Animazioni CSS sospese fuori schermo e nelle schede nascoste, mantenendo la fase per la ripresa. Observer condivisi e cleanup dei listener.
- Meno render nella macchina del tempo: il display degli anni aggiorna solo il proprio componente. Carrello e barre di avanzamento usano trasformazioni.
- Cinema e poster: letture del layout raggruppate, misure limitate alle sezioni vicine, nessuna riscrittura CSS quando il valore è invariato. Pausa, rewind e focus gestiti separatamente.
- Geometria degli adesivi precalcolata per dimensione; confronto di 432 frame con il comportamento precedente senza differenze nei risultati.
- Footer: proprietà CSS immutate non riscritte, fisica ferma fuori schermo, pointer cancel e perdita della cattura senza lanci involontari, gestione del puntatore attivo e timeout ripuliti.
- Feed: richieste simultanee deduplicate, cache condivisa, timeout, validazione del JSON e mantenimento del contenuto disponibile in caso di errore. Immagini differite e FAQ navigabili da tastiera.
- Mappa: geolocalizzazione protetta dopo lo smontaggio, ricentramento anche sul negozio già selezionato, resize verticale, traduzioni aggiornate ed errore di caricamento recuperabile.
- Contatti: gestione del focus anche durante il caricamento, Escape, pannello chiuso non interattivo, cleanup dei timer, validazione e disegni statici memoizzati.
- Navigazione: URL diretti e localizzati, Back/Forward, gestione dei caricamenti lenti e degli errori senza perdere l'intera pagina. La transizione attende il contenuto e mantiene il peel completo.
- CSS: eliminate le collisioni tra `.deal` del volantino e dei fornitori e tra le animazioni `shine` e `lcd-in`. Token condivisi e classe per i lettori di schermo disponibili anche senza i chunk secondari.
- Corretti avanzamento del calendario sul cambio dell'ora, sticky del calendario mobile, avvisi dei negozi oltre la scadenza dichiarata e menu mobile su schermi bassi.
- Il controllo Instagram verifica i riferimenti esistenti con timeout e scrittura atomica; non aggiorna il timestamp se la verifica fallisce.

## Verifiche ripetibili

```sh
npm run build
npm test
npm run lint
git diff --check
```

I cinque test automatici, eseguiti con Node 24, coprono URL e lingue, link precedenti, frammenti malformati, observer condivisi, sospensione/ripresa e cleanup anche dopo un remount.

La verifica nel browser usa la build di produzione servita localmente in Chrome headless, con viewport desktop e mobile. Sono controllati layout, interazioni, navigazione e gestione dei caricamenti. Le verifiche su telefono fisico e Safari restano distinte dall'emulazione.

- 30 combinazioni di tre pagine, cinque lingue e due viewport (1440 × 1000 e 390 × 844), senza overflow orizzontale; menu verificato anche a 844 × 390.
- Sei link diretti a sezioni, comprese URL localizzate: destinazione entro mezzo pixel dalla posizione di layout finale su entrambi i viewport.
- Undici controlli di caricamento lento/errore: chunk ritardato di 3,5 secondi con peel completo, navigazione abbandonata, chiusura del pannello prima del download, errori HTTP 503 simulati e download bloccato per 18 secondi. Il timeout libera la pagina e la risposta tardiva non cambia la destinazione.
- 24 controlli delle interazioni attive: mela, FAQ, cinema, drag annullato, video, focus e validazione contatti, negozi/geolocalizzazione, macchina del tempo, storico lingue e navigazione mobile. Nessuna eccezione JavaScript o richiesta fallita nel percorso normale.

Le sezioni già disabilitate dai flag esistenti restano disabilitate; per quelle parti la revisione è del codice e della compilazione.

Lint non riporta errori. Resta l'avviso già presente relativo all'esportazione di `useDockReview` dal file del componente `PalletDock`.

## Limiti funzionali rilevati

Il modulo contatti continua a simulare il successo con `setSent(true)`: il progetto non contiene un endpoint o un servizio di invio collegato. Il controllo arriva fino alla revisione con dati sintetici, senza inviare messaggi. Per l'invio reale serve il contratto del servizio destinatario.

Il controllo Instagram verifica i link già presenti nel JSON; non scopre automaticamente nuovi post e non costituisce un'integrazione con l'API Instagram.

L'audit riguarda il codice e le verifiche locali; non include una verifica del deploy in produzione.
