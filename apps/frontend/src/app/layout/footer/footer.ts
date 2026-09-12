import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoMark } from '../../shared/logo-mark/logo-mark';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoMark],
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
