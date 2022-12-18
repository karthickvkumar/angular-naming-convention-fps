/* Modules */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CoreServiceModule } from './core-services/core-services.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';

/* Components */
import { AppComponent } from './app.component';
import { HeaderComponent } from './core-components/header/header.component';
import { FooterComponent } from './core-components/footer/footer.component';
import { AudioPlayerComponent } from './core-components/audio-player/audio-player.component';
import { SideMenuComponent } from './core-components/side-menu/side-menu.component';
import { AlertComponent } from './core-components/alert/alert.component';
import { UnAuthorizedAccessComponent } from './core-components/unathorizedaccess/unauthorizedacess.component';
import { SideBarComponent } from './core-components/side-bar/side-bar.component';
import { LogoutComponent } from './core-components/logout/logout.component';
import { PageLoaderComponent } from './core-components/page-loader/page-loader.component';
import { ConfirmationComponent } from './core-components/confirmation/confirmation.component';
import { ViewPreviousEvaluationComponent } from './core-components/view-previous-evaluation/view-previous-evaluation.component';

/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AudioPlayerComponent,
    SideMenuComponent,
    AlertComponent,
    UnAuthorizedAccessComponent,
    LogoutComponent,
    ConfirmationComponent,
    PageLoaderComponent,
    ViewPreviousEvaluationComponent,
    SideBarComponent
  ],
  imports: [
    BrowserModule,
    CoreServiceModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatMenuModule,
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule
  ],
  entryComponents: [AlertComponent, ConfirmationComponent, ViewPreviousEvaluationComponent],
  bootstrap: [AppComponent],
  providers: []
})
export class AppModule { }
