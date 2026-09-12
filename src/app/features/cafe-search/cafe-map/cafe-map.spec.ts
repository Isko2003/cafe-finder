import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CafeMap } from './cafe-map';

describe('CafeMap', () => {
  let component: CafeMap;
  let fixture: ComponentFixture<CafeMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeMap],
    }).compileComponents();

    fixture = TestBed.createComponent(CafeMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
