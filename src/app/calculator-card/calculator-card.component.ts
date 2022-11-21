import { Component, OnInit } from '@angular/core';
import { Detail } from '../detail-type';

@Component({
  selector: 'app-calculator-card',
  templateUrl: './calculator-card.component.html',
  styleUrls: ['./calculator-card.component.css'],
})
export class CalculatorCardComponent implements OnInit {
  detail: Detail = {
    height: 61,
    weight: 120,
    BMI: 22.7,
    message: 'You are normal weight.',
  };
  calculateBMI(): void {
    if (this.detail.height <= 0 || this.detail.weight <= 0) {
      this.detail.BMI = -1;
      this.detail.message = 'Please enter a valid height and weight.';
      return;
    }
    this.detail.BMI =
      Math.round(((703 * this.detail.weight) / this.detail.height ** 2) * 10) /
      10;
    if (this.detail.BMI < 18.5) {
      this.detail.message = 'You are underweight.';
    } else if (this.detail.BMI < 25) {
      this.detail.message = 'Your BMI is normal.';
    } else if (this.detail.BMI < 30) {
      this.detail.message = 'You are overweight.';
    } else {
      this.detail.message = 'You are obese.';
    }
  }
  constructor() {}

  ngOnInit(): void {}
}
