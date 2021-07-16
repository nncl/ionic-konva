import { Component, OnInit } from '@angular/core';
import { LabelService } from '../services/label/label.service';
import { BehaviorSubject } from 'rxjs';

// import convertClipPath from 'clip-path-canvas';

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

  ionViewDidEnter() {
    // const wrapper: any = document.getElementById('clip-path-canvas-wrapper');
    // convertClipPath(wrapper, 'clip-path-mask-id');
    // console.log('aaaa'); // fixme
    // const canvas: any = document.getElementById('canvas');
    // const ctx = canvas.getContext('2d');
    //
    // // Create two clipping paths
    // const circlePath = new Path2D();
    // circlePath.arc(150, 75, 75, 0, 2 * Math.PI);
    // const squarePath = new Path2D();
    // squarePath.rect(85, 10, 130, 130);
    //
    // // Set the clip to the circle
    // ctx.clip(circlePath);
    // // Set the clip to be the intersection of the circle and the square
    // ctx.clip(squarePath);
    //
    // // Draw stuff that gets clipped
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

}
