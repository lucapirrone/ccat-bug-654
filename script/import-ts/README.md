## Scripts

### Dataset Generator

Questo script viene utilizzato per creare il dataset completo e da utilizzare successivamente come punto di partenza per gli script successivi. Prende in input un csv esportato dal db 'input/corsi.csv' e genera un dataset completo (output/dataset.json).
Questo dataset contiene informazioni del corso

### Dataset Improver

Questo script viene utilizzato per migliorare o estendere il dataset esistente con nuovi dati. Prende in input il dataset generato (output/dataset.json) e lo sovrascrive con la nuova versione.

### Knowledge Generator

Questo script genera il file di knowledge che poi verrà caricato all'interno di cheshire cat. Ogni riga del file txt corrisponde ad un determinato corso ed è strutturato in questo modo:
Corso denominato {course_name} disponibile al link https://my.learnn.com/corso/{course_id}

### Trainer Generator (obsoleto)

Questo script genera il dataset di training per effettuare il fine tuning di chat gpt.
