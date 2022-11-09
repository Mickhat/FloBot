# Logger

## Log Manager
Der Log-Manager kümmert sich um die Logs in einer Datei.
Beim erstellen wird die Datei erstellt.
Alle Logs enthalten einen Timestap, werden in die Konsole geschrieben und in eine Datei eingetragen.
Dazu muss die Methode log(type:string, text:string) oder logSync(type:string, text:string) genutzt werden.
Der LogManager loggt immer
```
<type> [master <Zeitstempel>] <Nachricht>
```

Im LogManager gibt es die Möglichkeit Logger zu erstellen.
Dafür nutzt man die Methode logger(name:string). Diese gibt einen Logger zurück

## Logger
Der Logger loggt in eine bestimmte Datei, ähnlich wie der Log-Manager
Dabei wird dem Logger aber ein Name zugewiesen.
```
<type> [<name> <Zeitstempel>] <Nachricht>
```
Der Logger loggt immer in die selbe Datei wie der LogManager, der ihn angelegt hat.