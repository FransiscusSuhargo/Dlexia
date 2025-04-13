import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [IonContent, IonicModule, IonHeader, IonTitle, IonToolbar]
})
export class StartPage {
  constructor(private navCtrl: NavController) {}

  ionViewDidEnter() {
    setTimeout(() => {
      this.navCtrl.navigateRoot('/library');
    }, 1200); // delay 2,5 detik atau sesuai kebutuhan
  }
}
