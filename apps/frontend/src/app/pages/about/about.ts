import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Value {
  title: string;
  body: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class About {
  protected readonly values: Value[] = [
    {
      title: 'Sadəlik əvvəl gəlir',
      body: 'Hər yeni funksiya "bu, kafə tapmağı asanlaşdırır, yoxsa çətinləşdirir?" sualından keçir.',
    },
    {
      title: 'Məlumat şəffaf olmalıdır',
      body: 'Ünvan, telefon, vebsayt — göstərdiyimiz hər məlumat birbaşa mənbədən götürülür, uydurulmur.',
    },
    {
      title: 'Sürət də dizaynın hissəsidir',
      body: 'Yüngül xəritə kitabxanası və minimal interfeys seçimi təsadüfi deyil — gözləmək istəmirik.',
    },
  ];
}
