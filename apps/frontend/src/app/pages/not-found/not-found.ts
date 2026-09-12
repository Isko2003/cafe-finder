import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoMark } from '../../shared/logo-mark/logo-mark';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, LogoMark],
  templateUrl: './not-found.html',
})
export class NotFound {}
