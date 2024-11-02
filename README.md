# Instalar liberia

```bash
npm i --save @capacitor-community/sqlite
npm i --save jeep-sqlite
npm i --save sql.js
npm i --save @capacitor/device
npm i --save @capacitor/preferences
```

# Configuración del proyecto 

Para que la base de datos funcione en la web hay que hacer unas ciertas configuraciones

# En ngModules

Nos vamos a app.modules.ts y hacemos lo siguiente

1. Importamos

```TS
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
```

2. Agregamos jeepSqlite es una etiqueta que nos permite usar sqlit en el navegador web

```TS
jeepSqlite(window);
```

3. debajo de bootstrap colocamos

```TS
schemas: [CUSTOM_ELEMENTS_SCHEMA],
```



## En stanaolone

Vamos primero en main.ts y hacemos lo siguiente
1. Importamos
```TS
import { provideHttpClient } from '@angular/common/http';
```
2. Colocamos en bootstrapApplication

```TS
provideHttpClient(),
```

Nos vamos a app.component y hacemos lo siguiente

3. Importamos


```JS
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
```

4.  Debajo de las importaciones colocamos

```JS
jeepSqlite(window);
```

5. Colocamos schemas en @Component

```JS
 schemas: [CUSTOM_ELEMENTS_SCHEMA],
```



## Configuraciones data base

1. Ir a la ruta node_modules/sql.js/dist
2. Copia el archivo sql-wasm.wasm y pégalo en assets
3. Crea una carpeta en assets llamada db y crea un archivo db.json

```json
{
  "database": "[nombre_base_datos].db",
  "version": 1,
  "encrypted": false,
  "mode": "full",
  // sección de la creación de tablas
  "tables": [
    {
      "name": "languages", // nombre de la tabla
      // esquema de va a tener las tablas
      "schema": [
        // por {} es una columna de una tabla
        {
          "column": "name", // nombre de la columna
          "value": "TEXT NOT NULL PRIMARY KEY" // estructura de la columna
        }
      ]
    }
  ]
}



```

4. Crear un servicio que realiza la administración de la base de datos

- AGREGAR ESTA IMPORTACIONES
```JS
// 
import {CapacitorSQLite, capSQLiteChanges,capSQLiteValues,} from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
```
- Métodos para el funcionamiento de sqlite

```JS
  // Atributos

  // Observable para comprobar si la base de datos esta lista
  public dbReady: BehaviorSubject<boolean>;
  // Indica si estamos en web
  public isWeb: boolean;
  // Indica si estamos en IOS
  public isIOS: boolean;
  // Nombre de la base de datos
  public dbName: string;

    constructor(private http: HttpClient) {
    this.dbReady = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIOS = false;
    this.dbName = '';
  }


    async init() {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    // Si estamos en Android, pedimos permiso
    if (info.platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error('Esta app necesita permisos para funcionar');
      }
      // Si estamos en web, iniciamos el web store
    } else if (info.platform == 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform == 'ios') {
      this.isIOS = true;
    }

    // Arrancamos la base de datos
    this.setupDatabase();
  }

  async setupDatabase() {
    // Obtenemos si ya hemos creado la base de datos
    const dbSetup = await Preferences.get({ key: 'first_setup_key' });

    // Si no la hemos creado, descargamos y creamos la base de datos
    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      // Nos volvemos a conectar
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbReady.next(true);
    }
  }

  downloadDatabase() {
    // Obtenemos el fichero assets/db/db.json
    this.http
      .get('assets/db/db.json')
      .subscribe(async (jsonExport: JsonSQLite) => {
        const jsonstring = JSON.stringify(jsonExport);
        // Validamos el objeto
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

        // Si es valido
        if (isValid.result) {
          // Obtengo el nombre de la base de datos
          this.dbName = jsonExport.database;
          // se importa  el json a la  base de datos
          await CapacitorSQLite.importFromJson({ jsonstring });
          // Crea la conexion conexion a sqlite
          await CapacitorSQLite.createConnection({ database: this.dbName });
          // abrimos la base de datos
          await CapacitorSQLite.open({ database: this.dbName });

          // Marca que ya se descargo la base de datos
          await Preferences.set({ key: 'first_setup_key', value: '1' });

          // Guardar el nombre de la base de datos
          await Preferences.set({ key: 'dbname', value: this.dbName });

          // Indico que la base de datos esta lista
          this.dbReady.next(true);
        }
      });
  }


  async getDbName() {
    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' });
      if (dbname.value) {
        this.dbName = dbname.value;
      }
    }
    return this.dbName;
  }



```

## Configuracion global

1. Importamos lo siguiente en app.component

```JS
import { Platform } from '@ionic/angular';
// servicio donde se encuentra las configuraciones de la base de datos
import { SqliteService } from 'src/shared/services/sqlite.service';
import { Device } from '@capacitor/device';
```
2. Para finalizar colocamos lo siguinete

```JS
public isWeb: boolean; // variable para validar si estamos en un la web
public load = false; // variable para el cargador de la pagina
constructor(private platform: Platform, private sqlite: SqliteService) {
  this.isWeb = false;
  this.initApp();
}
// método para la iniciar la base de datos
initApp() {
  this.platform.ready().then(async () => {
    const info = await Device.getInfo();
    this.isWeb = info.platform == 'web';
    this.sqlite.init();
    this.sqlite.dbReady.subscribe((load) => {
      this.load = load;
    });
  });
}

```

3. Nos vamos a app.component.html y hacemos lo siguinete 

```JS
<ion-app>
  @if(load){
  <ion-router-outlet></ion-router-outlet>
} @if (isWeb) {
  <jeep-sqlite></jeep-sqlite>
}
</ion-app>


```
