import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-mark',
  standalone: true,
  templateUrl: './logo-mark.html',
})
export class LogoMark {
  size = input(40);
}
