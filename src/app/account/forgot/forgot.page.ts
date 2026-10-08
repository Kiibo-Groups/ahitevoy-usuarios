import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ServerService } from '../../service/server.service';
import { ToastController, NavController, Platform, LoadingController } from '@ionic/angular';

@Component({
  standalone: false,
	selector: 'app-forgot',
	templateUrl: './forgot.page.html',
	styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

	user_id: any;
	newPassword = false;
	email: any;
	text: any;

	constructor(
		public server: ServerService,
		public toastController: ToastController,
		private nav: NavController,
		public loadingController: LoadingController,
    	private cdr: ChangeDetectorRef
	) {
		this.text = JSON.parse(localStorage.getItem('app_text'));
	}

	ngOnInit() {

	}

	async forgot(data, type = "new") {

		if (type == "new" && data.email.length == 0) {
			this.presentToast('Porfavor Ingresa un Correo electronico', 'warning');
		}
		else {
			const loading = await this.loadingController.create({
				message: 'Porfavor espere...',
				mode: 'ios'
			});
			await loading.present();

			this.server.forgot(data).subscribe((response: any) => {
				console.log(response)
				if (response.msg == "error") {
					this.presentToast(response.error, 'danger');
				}
				else {
					this.presentToast("El codigo de recuperación ha sido enviado", 'primary');
					this.user_id = response.user_id;
					this.email = data.email;
					this.cdr.detectChanges();
				}

				loading.dismiss();

			});
		}
	}

	async verify(data) {
		if (data.otp.length == 0) {
			this.presentToast('Porfavor ingresa el codigo.', 'warning');
		}
		else {
			const loading = await this.loadingController.create({
				message: 'Porfavor espera...',
				duration: 3000,
				mode: 'ios'
			});
			await loading.present();

			var allData = { otp: data.otp, user_id: this.user_id }

			this.server.verify(allData).subscribe((response: any) => {

				if (response.msg == "error") {
					this.presentToast(response.error, 'danger');
				}
				else {
					this.user_id = response.user_id;
					this.newPassword = true;
					this.presentToast("Correo verificado con exito.", 'success');
					this.cdr.detectChanges();
				}
				loading.dismiss();
			});
		}
	}

	async new_password(data) {
		if (data.password.length == 0) {
			this.presentToast('Porfavor ingresa tu nueva contraseña', 'warning');
		}
		else if (data.password != data.new_password) {
			this.presentToast('Confirme que las contraseñas coincidan.', 'warning');
		}
		else {
			const loading = await this.loadingController.create({
				message: 'Please wait...',
				duration: 3000,
				mode: 'ios'
			});
			await loading.present();

			var allData = { password: data.password, user_id: this.user_id }

			this.server.updatePassword(allData).subscribe((response: any) => {

				if (response.msg == "error") {
					this.presentToast(response.error, 'danger');
				}
				else {
					this.nav.navigateForward('/login');
					this.presentToast("Nueva contraseña actualizada con éxito.", 'success');
					this.cdr.detectChanges();
				}
				loading.dismiss();
			});
		}
	}

	async presentToast(txt, color) {
		const toast = await this.toastController.create({
			message: txt,
			duration: 3000,
			position: 'top',
			mode: 'ios',
			color: color
		});
		toast.present();
	}

	resend() {
		this.forgot({ email: this.email });
	}
}
