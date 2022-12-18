import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStateService } from './app-services/applicationstate.service';
import { AuthService } from './app-services/authentication.service';
import { AppAuthGuard } from './app-services/auth-guard.service';
import { HttpClientModule } from '@angular/common/http';
import { AudioPlayerService } from './ui-services/audio-player.service';
import { ApiInterceptorProvider } from './app-services/interceptor.service';
import { PageLoaderService } from './ui-services/page-loader.service';
import { NotificationService } from './ui-services/notification.service';
import { ErrorHandlerService } from './ui-services/error-handler.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from './app-services/user.service';
import { WindowDialogService } from './app-services/window-dialog.service ';
import { CheckLoginGuard } from './app-services/check-login-guard.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  declarations: [],
  providers: [
    ApiInterceptorProvider,
    ApplicationStateService,
    AuthService,
    AppAuthGuard,
    CheckLoginGuard,
    AudioPlayerService,
    PageLoaderService,
    NotificationService,
    UserService,
    WindowDialogService,
    ErrorHandlerService
  ]
})
export class CoreServiceModule { }
