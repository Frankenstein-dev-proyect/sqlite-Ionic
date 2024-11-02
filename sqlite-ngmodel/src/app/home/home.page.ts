import { Component } from '@angular/core';
import { SqliteService } from '../shared/services/sqlite.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  lenguage: string;
  lenguages!: string[];
  constructor(private sqlite: SqliteService) {
    this.lenguage = '';
    this.lenguages = [];
  }
  ionViewWillEnter() {
    this.read();
  }

  public create() {
    this.sqlite
      .create(this.lenguage.toLocaleUpperCase())
      .then((changes) => {
        console.log(changes);
        console.log('created');
        this.read();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public read() {
    this.sqlite
      .read()
      .then((languages: string[]) => {
        this.lenguages = languages;
        console.log('exito');
        console.log(languages);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  public update(lenguage: string) {
    this.sqlite
      .update(this.lenguage.toLocaleUpperCase(), lenguage)
      .then((changes) => {
        console.log(changes);
        console.log('Actualizado');
        this.read();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public delete(lenguage: string) {
    this.sqlite
      .delete(lenguage)
      .then((changes) => {
        console.log(changes);
        console.log('created');
        this.read();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
