import { Component } from '@angular/core';
import { LabelService } from '../services/label/label.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: [ 'tab3.page.scss' ]
})
export class Tab3Page {
  $label: BehaviorSubject<string>;

  constructor(private label: LabelService) {
    this.$label = label.label;
  }

}
