import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Platform } from '@ionic/angular';
import { SqliteService } from 'src/shared/services/sqlite.service';
import { Device } from '@capacitor/device';
jeepSqlite(window);
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  providers: [SqliteService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  public isWeb: boolean;
  public load = false;
  constructor(private platform: Platform, private sqlite: SqliteService) {
    this.isWeb = false;
    this.initApp();
  }

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
}
