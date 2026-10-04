# ponytail-plus

Modalità "senior dev pigro" per Claude Code: **pensa in grande, scrivi poco**.
Unisce in un solo plugin i tratti migliori di sette progetti della famiglia Ponytail.

| Da | Cosa ho preso |
|---|---|
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | La scala in 7 gradini, i livelli lite/full/ultra, il fix alla causa radice, i commenti `ponytail:`, le skill review/audit/debt/help, i limiti di sicurezza da non tagliare mai |
| [AbdullahHameedKhan/karpathy-ponytail-skills](https://github.com/AbdullahHameedKhan/karpathy-ponytail-skills) | Capire prima di scrivere (esplicitare le assunzioni), modifiche chirurgiche, obiettivi verificabili |
| [AyanbekDos/ponystack](https://github.com/AyanbekDos/ponystack) | Il router di fase (capire / implementare / revisionare) e il passaggio finale che taglia un piano troppo ampio |
| [JayPokale/Chisle](https://github.com/JayPokale/Chisle) | La dieta dei token: grep prima di leggere, niente riletture, ragionamento solo dove serve |
| [ilindaniel/ponytail-lite](https://github.com/ilindaniel/ponytail-lite) | Hook ridotti all'osso: un solo file JS, zero dipendenze |
| ponytail-hermes, dsh-ponytail | Sono solo port dell'originale su altre piattaforme: nessun tratto nuovo |

Cosa ho scartato:
- `ponytail-gain` e `ponystack-ratio`: mostrano numeri di benchmark o stime dei token che non si possono verificare sul tuo repo.
- Gli adattatori per altri 20 agenti, la statusline, il server MCP.

## Installazione

Nel prompt di Claude Code, due messaggi separati:

```
/plugin marketplace add FrescaInsalata/ponytail-plus
/plugin install ponytail-plus@ponytail-plus
```

Serve `node` nel PATH, per gli hook.

## Uso

- `/ponytail lite|ultra|off`: cambia livello (predefinito `full`). Per spegnerlo puoi anche scrivere "stop ponytail".
- `/ponytail-review`: lista di cosa tagliare in un diff o in un piano.
- `/ponytail-audit`: audit di tutto il repo.
- `/ponytail-debt`: registro delle scorciatoie lasciate di proposito.
- `/ponytail-help`: scheda riassuntiva.
- Livello predefinito: variabile d'ambiente `PONYTAIL_DEFAULT_MODE`.

Test: `node --test hooks/ponytail.test.js`
