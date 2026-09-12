import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CafesPage } from './cafes-page';

describe('CafesPage', () => {
  let component: CafesPage;
  let fixture: ComponentFixture<CafesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CafesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
