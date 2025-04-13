import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonApp, IonRouterOutlet, NavController, Platform } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private navCtrl: NavController) {
    this.initializeApp();
  }

  async initializeApp() {
    await SplashScreen.hide(); // Langsung hide native splash
    this.navCtrl.navigateRoot('/start'); // Arahkan ke fake splash
  }
}
