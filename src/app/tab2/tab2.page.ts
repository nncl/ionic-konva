import { Component } from '@angular/core';
import { LabelService } from '../services/label/label.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  $label: BehaviorSubject<any>;

  constructor(private labelService: LabelService) {
    this.$label = labelService.label;
  }

}
