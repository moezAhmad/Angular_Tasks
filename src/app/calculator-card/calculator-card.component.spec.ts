import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorCardComponent } from './calculator-card.component';

describe('CalculatorCardComponent', () => {
  let component: CalculatorCardComponent;
  let fixture: ComponentFixture<CalculatorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
