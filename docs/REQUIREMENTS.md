# Követelmények

## Cél

Egy asztalos **single round-robin** bajnokság vezetése: minden játékos **pontosan egyszer** játszik minden másikkal. A meccsek sorrendje **determinisztikus**; **nincs** véletlenszerű keverés (shuffle).

## Bemenet: játékos sorrend

A **Start** gomb a névbekérőn megjelenő játékosok **aktuális listasorrendjéből** építi az ütemezést (felülről lefelé: 1., 2., …). Ugyanaz a névsor és sorrend mindig ugyanazt a meccslistát adja.

## Nézetek

1. **Setup (`/`)**
   - Játékosok hozzáadása névvel, eltávolítás listából.
   - Legalább **két** nem üres név kell a starthoz.
   - A header **Start** gombja csak ebben a nézetben aktív, ha a feltétel teljesül.
   - **Visszaállítás**: törli a mentett állapotot, visszaáll az üres setupra, navigáció `/`.

2. **Mérkőzés (`/jatek`)**
   - Aktuális meccs két játékosa; a győztes **koppintással** választható (két „kártya”).
   - Bármelyik aktuális játékos **kizárható** („kizárás” gomb), ha már nem akar játszani.
   - Kizárás után az adott játékos összes érintett meccse kikerül a lebonyolításból, és ezek nem számítanak a ranglistába sem.
   - Ha már csak **2 aktív játékos** maradt, további kizárás **nem engedélyezett**.
   - **Következő**: csak győztes megadása után aktív; lépteti a meccsindexet.
   - **Utolsó meccs**: az elsődleges gomb szövege **Befejezés**; győztes után a **eredmény** nézetre visz (`/eredmeny`).
   - **Következőként felkészülnek**: a soron következő meccs két játékosa; ha nincs több meccs, üzenet: nincs több meccs.
   - **Ranglista**: jobb oldali sáv, becsukható; állapot mentve (sidebar collapsed).

3. **Eredmény (`/eredmeny`)**
   - Dobogó: első három helyezett a rangsor szerint. Kevesebb játékos esetén a hiányzó helyek „—”.

## Rangsor (MVP)

- Elsődleges: **győzelmek száma** (csökkenő).
- Döntetlen: **regisztrációs sorrend** (a setup listában korábban szereplő előrébb).

## Páratlan létszám

A kör módszer **bye** fordulókat használ; a bye nem játékos, nem jelenik meg meccsként.

## localStorage

- Kulcs: `gabi-david-rr-v2`.
- Verzió mező: jelenleg `2`. Ismeretlen verzió esetén az alkalmazás alapállapotot tölt.
- Sérült JSON / hiányzó mezők: alapállapot.

## Későbbi bővítések (nem része az MVP specnek)

- Visszaállítás megerősítő modál.
- Head-to-head vagy szett/pont tie-break.
- Több asztal / csoportos forma.
