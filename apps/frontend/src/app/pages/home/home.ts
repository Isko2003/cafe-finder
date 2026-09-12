import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  index: string;
  title: string;
  body: string;
}

interface Benefit {
  title: string;
  body: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  protected readonly steps: Step[] = [
    {
      index: '1',
      title: 'Məkanını paylaş',
      body: 'Brauzer səndən icazə istəyir, sən təsdiqləyirsən — bu qədər sadədir.',
    },
    {
      index: '2',
      title: 'Radiusu seç',
      body: 'Neçə yüz metr, yoxsa bir neçə kilometr ətrafında axtarmaq istədiyini özün müəyyən et.',
    },
    {
      index: '3',
      title: 'Xəritədə kəşf et',
      body: 'Ən yaxın kafələr nişanlarla görünür — ünvan, telefon və vebsayt bir toxunuşda.',
    },
  ];

  protected readonly benefits: Benefit[] = [
    {
      title: 'Sənin yerinə görə, canlı',
      body: 'Nəticələr hər dəfə real vaxtda, məhz haradasansa oradan hesablanır — köhnəlmiş siyahılar yoxdur.',
    },
    {
      title: 'Lazımsız detal yoxdur',
      body: 'Reklam, hesab yaratma, sonsuz filtr yoxdur. Sadəcə ünvan, telefon və sayt — lazım olan qədər.',
    },
    {
      title: 'Açıq mənbəli xəritə',
      body: 'MapLibre və OpenFreeMap üzərində qurulub, ona görə xəritə sürətli açılır və ağır yüklənmir.',
    },
  ];
}
